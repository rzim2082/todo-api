var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

var app = express();
var port = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1; //as we add todos they get new id



app.use(bodyParser.json());


app.get('/', function(req, res) {
	res.send('Todo API Root');
});


app.get('/todos', middleware.requireAuthentication, function(req, res) {
	var queryParams = req.query;
	console.log(queryParams);

	var where = {userId: req.user.get('id')}; //req.user.get(id)
	
	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		where.completed = true;
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false'){
		where.completed = false;
	};
	
	if (queryParams.hasOwnProperty('q') && queryParams.q.length >0) {
		where.description = {
			$like: '%' + queryParams.q + '%' //this is basically a regexp
		};
	}

	db.todo.findAll({where: where}).then(function(todos){
		res.json(todos);
	}, function(e){
		res.status(500).send();
	});
	
});


// GET /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoID = req.params.id; //if we needed a === we would parseInt the string
	
	db.todo.findOne({
		where: {
			id: todoID,
			userId: req.user.get('id')
		}
	}).then(function(todo){
		if(!!todo){ //if you put !! this sets it to truthy, only run if todo item
			res.json(todo);
		} else {
			res.status(404).send();
		}
		
	}, function(e){
		res.status(500).json(e);
	});
});



app.post('/todos', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	
	db.todo.create(body).then(function(todo){
		
		req.user.addTodo(todo).then(function(){
			return todo.reload();
		}).then(function(todo){
			res.json(todo.toJSON());
		});
	}, function(e){
		return res.status(400).json(e);

	});

});





app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoID = parseInt(req.params.id, 10);
	
	db.todo.destroy({
		where: {
			id: todoID,
			userId: req.user.get('id')
		}
	}).then(function(rowsDeleted){
		if(rowsDeleted === 0){
			res.status(404).json({
				error: 'No todo with id'
			});
		} else {
			res.status(204).send();
		}
	},function(e){
		res.status(500).send();
	});

});

//PUT /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoID = parseInt(req.params.id, 10);
	
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};
	
	if (body.hasOwnProperty('completed')) {
		validAttributes.completed = body.completed;
	} 

	if (body.hasOwnProperty('description') ) {
		validAttributes.description = body.description;
	} 

	db.todo.findOne({
		where: {
			id: todoID,
			userId: req.user.get('id')
		}
	}).then(function(todo){
		if(todo){
			todo.update(validAttributes)
				.then(function(todo){
					res.json(todo.toJSON());
				}, function(e){
					res.status(400).json(e);
			});
		}else {
			res.status(404).send();
		}
	}, function(){
		res.status(500).send();
	});

});

app.post('/users', function(req, res){
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function(user){
		res.json(user.toPublicJSON());
	}, function(e){
		res.status(400).json(e);
	});

});



app.post('/users/login', function(req, res){
	var body = _.pick(req.body, 'email', 'password');
	var userInstance;

	db.user.authenticate(body).then(function (user) {
		var token = user.generateToken('authentication');
		userInstance = user;

		return db.token.create({
			token: token
		});

	}).then(function(tokenInstance){
		res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
	}).catch(function() {
		res.status(401).json();
	});


});


app.delete('/users/login', middleware.requireAuthentication, function(req, res){
	req.token.destroy().then(function(){
		res.status(204).send();
	}).catch(function(){
		res.status(500).send();
	});

});


db.sequelize.sync({
	force: true, 
	logging: console.log
	})
	.then(function(){ //this force is to make sure every password is salted and hashed
	app.listen(port, function() {
	console.log('Express listening on ' + port);
	});
});

