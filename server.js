var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var todos = [{
	id: 1,
	description: 'Meet mom for lunch',
	completed: false

},{
	id: 2,
	description: 'Go to market',
	completed: false

},{
	id: 3,
	description: 'Start Dinner',
	completed: true
}];

// GET /todos
app.get('/todos', function(req, res){
	res.json(todos);
});
// GET /todos/:id
app.get('/todos/:id', function(req,res){
	var todoID = req.params.id; //if we needed a === we would parseInt the string
	var foundID;
	for(var i = 0; i < todos.length; i++){
		if(todos[i].id == todoID){ //above here is what I am talking about
			foundID = todos[i];
		}
	}
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


app.get('/', function(req, res){
	res.send('Todo API Root');
});


app.listen(port, function(){
	console.log('Express listening on ' + port);
})