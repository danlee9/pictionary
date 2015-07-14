var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var users = [];
var allClients = [];
var num = 0;
var drawerPresent = false;
var WORDS = [
  "word", "letter", "number", "person", "pen", "class", "people",
  "sound", "water", "side", "place", "man", "men", "woman", "women", "boy",
  "girl", "year", "day", "week", "month", "name", "sentence", "line", "air",
  "land", "home", "hand", "house", "picture", "animal", "mother", "father",
  "brother", "sister", "world", "head", "page", "country", "question",
  "answer", "school", "plant", "food", "sun", "state", "eye", "city", "tree",
  "farm", "story", "sea", "night", "day", "life", "north", "south", "east",
  "west", "child", "children", "example", "paper", "music", "river", "car",
  "foot", "feet", "book", "science", "room", "friend", "idea", "fish",
  "mountain", "horse", "watch", "color", "face", "wood", "list", "bird",
  "body", "dog", "family", "song", "door", "product", "wind", "ship", "area",
  "rock", "order", "fire", "problem", "piece", "top", "bottom", "king",
  "space"
];

var chooseWord = function() {
	var num = Math.floor(Math.random() * WORDS.length);
	return WORDS[num];
}

var currentWord = '';
var currentDrawerId;

io.on('connection', function(client) {
	client.on('join', function(data) {
		allClients.push(client);
		var current = num;
		var user = {
			id: current
		}
		users.push(user);
		client.emit('join', user.id);
		num++;
		if (!drawerPresent) {
			currentDrawerId = users[0].id;
			client.emit('designate', currentDrawerId);
			currentWord = chooseWord();
			client.emit('setWord', currentWord);
		}
		drawerPresent = data;
		client.emit('change', users.length);
		client.broadcast.emit('change', users.length);
	});
	client.on('draw', function(position) {
		client.broadcast.emit('draw', position);
	});
	client.on('guess', function(guess) {
		client.broadcast.emit('guess', guess.guess);
		client.emit('guess', guess.guess);
		if (guess.guess == currentWord) {
			var prevDrawerId = currentDrawerId;
			client.emit('correctGuess', guess.id);
			client.broadcast.emit('correctGuess', guess.id);
			client.broadcast.emit('dedesignate', prevDrawerId);
			currentDrawerId = guess.id;
			client.emit('designate', currentDrawerId);
			currentWord = chooseWord();
			client.emit('setWord', currentWord);
		}
	});
	client.on('disconnect', function(data) {
		var i = allClients.indexOf(client);
		allClients.splice(i, 1);
		users.splice(i, 1);
		client.broadcast.emit('change', users.length);
		if (currentDrawerId == i) {
			drawerPresent = false;
		}
		client.broadcast.emit('leave', i);
		if (!drawerPresent) {
			currentDrawerId = users[0].id;
			client.broadcast.emit('designate', currentDrawerId);
			// currentWord = chooseWord();
			client.broadcast.emit('setWord', currentWord);
		}
	});
});

server.listen(8080, function() {
	console.log('Listening on port 8080');
});