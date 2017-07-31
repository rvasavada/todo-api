var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
	id: 1,
	description: 'meet mom over brunch',
	completed: false
}, {
	id: 2,
	description: 'go to market',
	completed: false
}, {
	id: 3,
	description: 'feed cat',
	completed: false
}];

app.get('/', function(req, res) {
	res.send('todo API Root');
});

//GET /todos
app.get('/todos', function(req, res) {
	res.json(todos);
});

//GET /todos/:id
app.get('/todos/:id', function(req, res) {
	var toDoId = parseInt(req.params.id, 10);
	var matchedTodos;

	for(var i = 0; i < todos.length; i++) {
		if (todos[i].id === toDoId) {
			matchedTodos = todos[i];
		}	
	}

	if (matchedTodos) {
		res.json(matchedTodos);
	} else {
		res.status(404).send();	
	}
});

app.listen(PORT, function() {
	console.log('express listening on port ' + PORT + '!');
});