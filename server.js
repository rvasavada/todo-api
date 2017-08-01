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

//GET /todos?completed=true&q=work
app.get('/todos', function(req, res) {
	var queryParams = req.query;
	var filteredTodos = todos;

	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		if(queryParams.hasOwnProperty('q') && queryParams.q > 0) {
			filteredTodos = _.filter(_.where(filteredTodos, {completed: true}), function(todo) { return todo.description.indexOf(queryParams.q) > -1});
		} else {
			filteredTodos = _.where(filteredTodos, {completed: true});
		}
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		if(queryParams.hasOwnProperty('q') && queryParams.q > 0) {
			filteredTodos = _.filter(_.where(filteredTodos, {completed: false}), function(todo) { return todo.description.indexOf(queryParams.q) > -1});
		} else {
			filteredTodos = _.where(filteredTodos, {completed: false});
		}
	}
	

	res.json(filteredTodos);
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

//PUT /todos/:id
app.put('/todos/:id', function(req, res) {
	var toDoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: toDoId});
	var body = _.pick(req.body, 'completed', 'description');
	var validAttributes = {};

	if (!matchedTodo) {
		res.status(404).json({"error": 'couldn\'t find id'});	
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		// bad
		res.status(404).json({"error": 'couldn\'t update completed'});	
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description.trim();
	} else if (body.hasOwnProperty('description')) {
		// bad
		res.status(404).json({"error": 'couldn\'t update description'});	
	}

	_.extend(matchedTodo, validAttributes);
	
	res.json(matchedTodo);


});

app.listen(PORT, function() {
	console.log('express listening on port ' + PORT + '!');
});