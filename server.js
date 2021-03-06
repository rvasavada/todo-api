var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

var bodyParser = require('body-parser');

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('todo API Root');
});

//GET /todos?completed=true&q=work
app.get('/todos', middleware.requireAuthentication, function(req, res) {
	var query = req.query;
	var where = {};

	where.userId = req.user.get('id');

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	if (query.hasOwnProperty('q') && query.q > 0) {
		where.description =  {
				$like: "%" + query.q + "%"
		};
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		if (!!todos) {
			res.status(200).json(todos);	
		} else {
			res.status(404).send();
		}
		
	}, function(error) {
		res.status(500).send();
	});



	// var filteredTodos = todos;

	// if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
	// 	if (queryParams.hasOwnProperty('q') && queryParams.q > 0) {
	// 		filteredTodos = _.filter(_.where(filteredTodos, {
	// 			completed: true
	// 		}), function(todo) {
	// 			return todo.description.indexOf(queryParams.q) > -1
	// 		});
	// 	} else {
	// 		filteredTodos = _.where(filteredTodos, {
	// 			completed: true
	// 		});
	// 	}
	// } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
	// 	if (queryParams.hasOwnProperty('q') && queryParams.q > 0) {
	// 		filteredTodos = _.filter(_.where(filteredTodos, {
	// 			completed: false
	// 		}), function(todo) {
	// 			return todo.description.indexOf(queryParams.q) > -1
	// 		});
	// 	} else {
	// 		filteredTodos = _.where(filteredTodos, {
	// 			completed: false
	// 		});
	// 	}
	// }


	// res.json(filteredTodos);
});

//GET /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var toDoId = parseInt(req.params.id, 10);

	db.todo.findOne({
		where: {
			id: toDoId,
			userId: req.user.get('id')
		}
	}).then(function(todo) {
		if (!!todo) {
			res.status(200).json(todo.toJSON());	
		} else {
			res.status(404).send();
		}
		
	}, function(error) {
		res.status(500).send();
	});

	// var matchedTodo = _.findWhere(todos, {
	// 	id: toDoId
	// });

	// if (matchedTodo) {
	// 	res.json(matchedTodo);
	// } else {
	// 	res.status(404).send();
	// }
});

//POST /todos
app.post('/todos', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'completed', 'description');

	//call create on db.todo
	//  respond with 200 and todo
	//  e res.status(400).json(e);

	db.todo.create({
		description: body.description,
		completed: body.completed,
		userId: req.user.get('id')
	}).then(function (todo) {
		//res.status(200).json(todo.toJSON());
		req.user.addTodo(todo).then(function () {
			return todo.reload();
		}).then(function (todo) {
			res.status(200).json(todo.toJSON());
		});
	}).catch(function (error) {
		res.status(400).json(error);
	});


	// if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
	// 	return res.status(400).send();
	// }

	// body.description = body.description.trim();

	// console.log('description: ' + body.description);

	// body.id = todoNextId++;
	// todos.push(body);

	// res.json(body);
});

//DELETE /todos/:id
app.delete('/todos/:id',  middleware.requireAuthentication, function(req, res) {
	var toDoId = parseInt(req.params.id, 10);

	db.todo.findOne({
		where: {
			id: toDoId,
			userId: req.user.get('id')
		}
	}).then(function (todo) {
		if (!!todo) {
			todo.destroy();
			res.status(204).send();
		} else {
			res.status(400).send();
		}		
	}, function (error) {
		res.status(500).send();
	});

	// var matchedTodo = _.findWhere(todos, {
	// 	id: toDoId
	// });

	// if (matchedTodo) {
	// 	todos = _.without(todos, matchedTodo);
	// 	res.json(matchedTodo);
	// } else {
	// 	res.status(404).json({
	// 		"error": 'couldn\'t find id'
	// 	});
	// }
});

//PUT /todos/:id
app.put('/todos/:id',  middleware.requireAuthentication, function(req, res) {
	var toDoId = parseInt(req.params.id, 10);
	console.log(toDoId);
	var body = _.pick(req.body, 'completed', 'description');
	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findOne({
		where: {
			id: toDoId,
			userId: req.user.get('id')
		}
	}).then(function(todo) {
		console.log(todo);
		if (todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(error) {
				res.status(400).json(error);
			});
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	});

	// var matchedTodo = _.findWhere(todos, {
	// 	id: toDoId
	// });
	// var body = _.pick(req.body, 'completed', 'description');
	// var validAttributes = {};

	// if (!matchedTodo) {
	// 	res.status(404).json({
	// 		"error": 'couldn\'t find id'
	// 	});
	// }

	// if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
	// 	validAttributes.completed = body.completed;
	// } else if (body.hasOwnProperty('completed')) {
	// 	// bad
	// 	res.status(404).json({
	// 		"error": 'couldn\'t update completed'
	// 	});
	// }

	// if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
	// 	validAttributes.description = body.description.trim();
	// } else if (body.hasOwnProperty('description')) {
	// 	// bad
	// 	res.status(404).json({
	// 		"error": 'couldn\'t update description'
	// 	});
	// }

	// _.extend(matchedTodo, validAttributes);

	// res.json(matchedTodo);


});

app.post('/users', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function (user) {
		res.json(user.toPublicJSON());
	}, function (e) {
		res.status(400).json(e);
	});
});

// POST /users/login
app.post('/users/login', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');
	var userInstance;

	db.user.authenticate(body).then(function (user) {
		var token = user.generateToken('authentication');
		userInstance = user;

		return db.token.create({
			token: token
		});
	}).then(function (tokenInstance) {
		res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
	}).catch(function () {
		res.status(401).send();
	});
});

// DELETE /users/login
app.delete('/users/login', middleware.requireAuthentication, function (req, res) {
	req.token.destroy().then(function () {
		res.status(204).send();
	}).catch(function () {
		res.status(500).send();
	});
});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('express listening on port ' + PORT + '!');
	});
});
