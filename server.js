var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var app = express();
var port = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1; //as we add todos they get new id

app.use(bodyParser.json());

// GET /todos?completed=true needs to be string true not boolean
app.get('/todos', function(req, res){
	var queryParams = req.query;
	var filteredTodos = todos;
	//console.log(queryParams); this was a test
	//if has property && completed === 'true'
	if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true'){
		filteredTodos = _.where(filteredTodos, {"completed": true});
	}else if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'false'){
		filteredTodos = _.where(filteredTodos, {"completed": false});
	}else if(queryParams.hasOwnProperty('completed')){
		return res.status(400).json({"error": "none found"});
	}

	res.json(filteredTodos);
});


// GET /todos/:id
app.get('/todos/:id', function(req,res){
	var todoID = req.params.id; //if we needed a === we would parseInt the string
	var foundID = _.findWhere(todos, {id: todoID});

	if(foundID){
		res.json(foundID);
	}else{
		res.status(404).send();
	}
});



app.post('/todos', function(req, res){
	var body = _.pick(req.body, 'description', 'completed');
	//underscore pick ({what you want to check}, what you want to keep)
	if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
		return res.status(400).send();
	}

	// set body.description to be trim() value
	body.description = body.description.trim();
	body.id = todoNextId;
	todoNextId++;
	todos.push(body);
	//console.log('description: ' + body.description); //for testing
	//console.log(body); //this is a test

	res.json(body);
});


app.get('/', function(req, res){
	res.send('Todo API Root');
});

//DELETE /todos/:id
app.delete('/todos/:id', function(req,res){
	var todoID = parseInt(req.params.id, 10);
	var foundID = _.findWhere(todos, {id: todoID});
	if(!foundID){
		res.status(404).json({"error": "no todo found with that id"});
	}else{
		todos = _.without(todos, foundID);
		res.status(200).json(foundID);
	}
});

//PUT /todos/:id
app.put('/todos/:id', function(req, res){
	var todoID = parseInt(req.params.id, 10);
	var foundID = _.findWhere(todos, {id: todoID});
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};

	if(!foundID){
		return res.status(404).send();
	}

	//body.hasOwnProperty('completed') returns boolean
	if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
		validAttributes.completed = body.completed;
	}else if (body.hasOwnProperty('completed')){
		// Bad
		return res.status(400).send();
	}else {
		// Never provided attribute, no problem here
	}

	if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
		validAttributes.description = body.description;
	}else if(body.hasOwnProperty('description')){
		return res.status(400).send();
	}else {
		// Never provided attribute, no problem here
	}
	//Here
	_.extend(foundID, validAttributes); //passed around variable no need to do anything else
	res.json(foundID);

});


app.listen(port, function(){
	console.log('Express listening on ' + port);
})