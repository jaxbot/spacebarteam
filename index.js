var io = require('socket.io')(8009);

var correctInstructions;
var level;
var levelControls = require('./level');

function initGame() {
  correctInstructions = 0;
  level = 0;
  console.log(io);
}

initGame();

setInterval(function() {
  var i = 0;
  var instructions = getInstructions();
  for (id in io.sockets.connected) {
    io.sockets.connected[id].emit("instruction", instructions[i]);
    i++;
  }
  io.emit("level", levelControls);
}, 5000);


function getInstructions() {
  for (var i = 0; i < levelControls.length; i++) {
    levelControls[i].desiredValue = rand(1);
  }
  return levelControls;
}

// Fisher-Yates shuffle
function shuffleArray(array) {
	for (var i = 1; i < array.length; i++) {
		var j = Math.floor(Math.random() * array.length);
		var tmp = array[i];
		array[i] = array[j];
		array[j] = tmp;
	}
}

function rand(i) {
  return Math.round(Math.random() * i);
}
