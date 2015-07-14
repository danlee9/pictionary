var pictionary = function() {
  var $canvas, context, $guessBox;
  var socket = io();
  var drawer = false; //Server will change to true for first user
  var drawing = false;
  var $draw = $('#draw');
  var $word = $('#word');
  var $num = $('#num');
  var $single = $('#single');
  var $multiple = $('#multiple');
  $multiple.hide();


  //Methods for updating user count, drawing, and making guesses
  var updateNum = function(num) {
    $num.text(num);
    if (num > 1) {
      $single.hide();
      $multiple.show();
    } else {
      $multiple.hide();
      $single.show();
    }
  };

  var draw = function(position) {
    context.beginPath();
    context.arc(position.x, position.y,
                     6, 0, 2 * Math.PI);
    context.fill();
  };

  var onKeyDown = function(event) {
    if (event.keyCode != 13) { // Enter
      return;
    }

    var guess = $guessBox.val();
    socket.emit('guess', {guess: guess, id: userId});
    console.log(guess);
    $guessBox.val('');
	};

	var $guess = $('#guess');
  $guessBox = $('#guess input');
	$guessBox.on('keydown', onKeyDown);
	var $recentGuess = $('#userGuess span');
	var userId;
	$userId = $('#userId');


	//Creating canvas and setting canvas listeners
  $canvas = $('canvas');
  context = $canvas[0].getContext('2d');
  $canvas[0].width = $canvas[0].offsetWidth;
  $canvas[0].height = $canvas[0].offsetHeight;
  $canvas.on('mousedown', function(e) {
  	drawing = true;
  });
  $canvas.on('mouseup', function(e) {
  	drawing = false;
  });
  $canvas.on('mousemove', function(event) {
  	if (!drawer || !drawing) {
  		return false;
  	}
    var offset = $canvas.offset();
    var position = {x: event.pageX - offset.left,
                    y: event.pageY - offset.top};
    socket.emit('draw', position);
    draw(position);
  });

	//Socket listening
  socket.on('draw', draw);
  socket.on('guess', function(guess) {
  	$recentGuess.text(guess);
  });
  socket.on('connect', function(data) {
  	socket.emit('join', true);
  });
  socket.on('join', function(id) {
  	userId = id;
  	$userId.text(userId);
  });
  socket.on('leave', function(data) {
  	alert("UserId" + i + " has left");
  })
  socket.on('designate', function(id) {
  	if (userId == id) {
  		drawer = true;
  		$guess.hide();
  		$draw.show();
  	}
  });
  socket.on('dedesignate', function(id) {
  	if (userId == id) {
  		drawer = false;
  		$draw.hide();
  		$guess.show();
  	}
  })
  socket.on('change', updateNum);
  socket.on('setWord', function(word) {
  	$word.text(word);
  });
  socket.on('correctGuess', function(id) {
  	alert("UserId" + id + " guessed the drawing correctly! He or she will be the " +
  		"new drawer.");
  	context.clearRect(0, 0, $canvas[0].width, $canvas[0].height);
  });
};

$(document).ready(function() {
  pictionary();
});