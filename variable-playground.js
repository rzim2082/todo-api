var person = {
	name: "Andrew",
	age: 21
};

function updatePerson(obj){
	/*obj = {
		name: 'Andrew',
		age: 24
	};*/
	obj.age = 24;
}

updatePerson(person);
console.log(person);


//Array Example
var grades = [15, 37];

function addToArray1(obj){
	obj = [15, 37, 45];
}

function addToArray2(obj){
	obj.push(45);
}

addToArray1(grades);
console.log(grades);
addToArray2(grades);
console.log(grades);