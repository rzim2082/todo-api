var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var app = express();
var port = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1; //as we add todos they get new id

app.use(bodyParser.json());

// GET /todos
app.get('/todos', function(req, res){
	res.json(todos);
});
// GET /todos/:id
app.get('/todos/:id', function(req,res){
	var todoID = req.params.id; //if we needed a === we would parseInt the string
	var foundID = _.findWhere(todos, {id: todoID});


	/*var foundID;
	for(var i = 0; i < todos.length; i++){
		if(todos[i].id == todoID){ //above here is what I am talking about
			foundID = todos[i];
		}
	}*/

	if(foundID){
		res.json(foundID);
	}else{
		res.status(404).send();
	}
	
	
	//iterate over todos array. find match
	//success response.json and pass todo item
	//unsuccess res.status(404).send();
	//res.send('Asking for todo with id of ' + req.params.id);
})



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

app.listen(port, function(){
	console.log('Express listening on ' + port);
})