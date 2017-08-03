var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	"dialect": 'sqlite',
	"storage": __dirname + '/basic-sqlite-databae.sqlite'
});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [1, 250]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});

sequelize.sync({
	//force: true
}).then(function() {
	
	//find by id
	//print it
	// if not then then say wasn't found

	Todo.findById(3).then(function (todo) {
		if (todo) {
			console.log(todo.toJSON());
		} else {
			console.log("todo not found");
		}
	})

	// Todo.create({
	// 	description: 'walk my dog',
	// 	completed: false
	// }).then(function(todo) {
	// 	return Todo.create({
	// 		description: 'clean office'
	// 	});
	// }).then(function () {
	// 	return Todo.findAll({
	// 		where: {
	// 			description: {
	// 				$like: "%dog%"
	// 			}
	// 		}
	// 	});
	// }).then(function (todos) {
	// 	if (todos) {
	// 		todos.forEach(function (todo) {
	// 			console.log(todo.toJSON());
	// 		});
	// 	} else {
	// 		console.log('no todo found!');
	// 	}
	// }).catch(function (error) {
	// 	console.log(error);
	// });
});