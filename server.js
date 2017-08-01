var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;
var _ = require('underscore');

var bodyParser = require('body-parser');

app.use(bodyParser.json());

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
	var matchedTodo = _.findWhere(todos, {id: toDoId});

	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();	
	}
});

//POST /todos
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'completed', 'description');

	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}

	body.description = body.description.trim();

	console.log('description: ' + body.description);

	body.id = todoNextId++;
	todos.push(body);

	res.json(body);
});

//DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
	var toDoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: toDoId});

	if (matchedTodo) {
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	} else {
		res.status(404).json({"error": 'couldn\'t find id'});	
	}
});

app.listen(PORT, function() {
	console.log('express listening on port ' + PORT + '!');
});