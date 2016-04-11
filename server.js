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

// GET /todos?completed=true&q='string'
app.get('/todos', middleware.requireAuthentication, function(req, res) {
	var queryParams = req.query;
	console.log(queryParams);

	var where = {userId: req.user.get('id')}; //req.user.get(id)
	//var filteredTodos = todos;
	/*
	// var where = {};
	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		filteredTodos = _.where(filteredTodos, {
			"completed": true
		});
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		filteredTodos = _.where(filteredTodos, {
			"completed": false
		});
	}*/
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
	/*else if(queryParams.hasOwnProperty('completed')){
			return res.status(400).json({"error": "none found"});
		}*/
	/*
	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		//console.log('entered if statment');
		filteredTodos = _.filter(filteredTodos, function(todo) {
			//console.log('enters filter');
			return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
		});
	}*/
	
	// q property should exist and have a length > 0
	//use filter
	//"Go to work on Saturday".indexOf('work')
	//console.log(filteredTodos);
	
	//res.json(where);
});


// GET /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoID = req.params.id; //if we needed a === we would parseInt the string
	/*
	var foundID = _.findWhere(db.todo, {
		id: todoID
	});

	if (foundID) {
		res.json(foundID);
	} else {
		res.status(404).send();
	}
	*/
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
	//underscore pick ({what you want to check}, what you want to keep)
	/* 
	call create on db.todo
		respond with 200 and value of todo call .todo.json
		fails call e res.status(400).json(e)

	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}

	// set body.description to be trim() value
	body.description = body.description.trim();
	body.id = todoNextId;
	todoNextId++;
	todos.push(body);
	//console.log('description: ' + body.description); //for testing
	//console.log(body); //this is a test

	res.json(body);*/
	db.todo.create(body).then(function(todo){
		//return res.json(todo.toJSON()); //do .toJSON() because there is alot more stuff in there that might need to be formatted
		req.user.addTodo(todo).then(function(){
			return todo.reload();
		}).then(function(todo){
			res.json(todo.toJSON());
		});
	}, function(e){
		return res.status(400).json(e);

	});

});




//DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoID = parseInt(req.params.id, 10);
	
	/*
	var foundID = _.findWhere(todos, {
		id: todoID
	});
	if (!foundID) {
		res.status(404).json({
			"error": "no todo found with that id"
		});
	} else {
		todos = _.without(todos, foundID);
		res.status(200).json(foundID);
	}
	*/
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
	/*
	var foundID = _.findWhere(todos, {
		id: todoID
	});*/
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};
	/*
	if (!foundID) {
		return res.status(404).send();
	}
	*/
	//body.hasOwnProperty('completed') returns boolean
	if (body.hasOwnProperty('completed') /*&& _.isBoolean(body.completed)*/) {
		validAttributes.completed = body.completed;
	} /*else if (body.hasOwnProperty('completed')) {
		// Bad
		return res.status(400).send();
	} else {
		// Never provided attribute, no problem here
	}*/

	if (body.hasOwnProperty('description') /*&& _.isString(body.description) && body.description.trim().length > 0*/) {
		validAttributes.description = body.description;
	} /*else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	} else {
		// Never provided attribute, no problem here
	}*/
	//Here
	/*_.extend(foundID, validAttributes); //passed around variable no need to do anything else
	res.json(foundID);*/

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

//user login post/users/login

app.post('/users/login', function(req, res){
	var body = _.pick(req.body, 'email', 'password');

	db.user.authenticate(body).then(function (user) {
		var token = user.generateToken('authentication');

		if(token){
			res.header('Auth', token).json(user.toPublicJSON())
		} else {
			res.status(401).send();
		}
		
	}, function () {
		res.status(401).send();
	});


	/* all of this has been moved to user.js user.authenticate method
	if(typeof body.email !== 'string' || typeof body.password !== 'string'){
		return res.status(400).json({
			error: 'invalid email or password'
		});
	}
	/
	db.user.findOne({
		where: {email: body.email}
	}).then(function(found){
		if(!found || !bcrypt.compareSync(body.password, found.get('password_hash'))){ //compareSynce will run comparison between password and hashed and salted password
			return res.status(401).send();
		}

		

		res.status(200).json(found.toPublicJSON());
		
	}, function(e) {
		res.status(500).send();
	});
	*/
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

