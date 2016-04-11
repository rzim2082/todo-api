var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'

});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,  //allow if null = false they must provide this
		validate: {
			len: [1, 250] //only take strings that are greater than 1 and less than 250
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});

var User = sequelize.define('user', {
	email: Sequelize.STRING
});


Todo.belongsTo(User);
User.hasMany(Todo);


sequelize.sync(/*{force: true}*/).then(function(){ //if i had made a mistake on spelling a key {force: true} in sync arg would correct it
	console.log('Everything is synced');

	/*
	User.findById(1).then(function(user){
		user.getTodos().then(function(todos){
			todos.forEach(function(todo){
				console.log(todo.toJSON());
			});
		});
	});*/

	User.findById(1).then(function(user){
		user.getTodos({where: {
			completed: false
		}}).then(function(todos){
			todos.forEach(function(todo){
				console.log(todo.toJSON());
			});
		});
	}).catch(function(e){
		console.log(e);
	});
	/*Todo.findById(2).then(function(todo){
		if(todo){
			console.log(todo.toJSON());
		}else{
			console.log('not found');
		}
	});*/
	/*User.create({
		email: 'andrew@example.com'
	}).then(function(){
		return Todo.create({
			description: 'Clean yard'
		});
	}).then(function(todo){
		User.findById(1).then(function (user){
			user.addTodo(todo);
		});
	});*/
});
/*
	Todo.create({
		description: 'Walk the dog',
		completed: false
	}).then(function(todo){
		return Todo.create({
			description: 'Clean office'
		});
	}).then(function(){
		//return Todo.findById(1);
		return Todo.findAll({
			where: {
				description: {
					$like: '%dog%'	//query option
				}
			}
		});
	}).then(function(todos){ //todos or todo depending on above findbyid or findall
		if(todos){
			todos.forEach(function(todo){
				console.log(todo.toJSON());
			});
			
		} else {
			console.log('no todo found');
		}
	}).catch(function(e){
		console.log(e);
	});
});
*/
