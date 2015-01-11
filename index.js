var io = require('socket.io')(8009);
var possibleControls = require('./controls');

var correctInstructions;
var countDown;
var level;
var levelControls;
var players;
var timeLeft;
var timeout;
var pendingInstructions = [];

function initGame() {
  clearInterval(countDown);
  correctInstructions = 0;
  level = 0;
  levelControls = shuffleArray(possibleControls);
  timeLeft = 30;

  for (var i = 0; i < levelControls.length; i++) {
    levelControls[i].id = i;
  }

  players = 0;
  getInstructions();
  pendingInstructions = [];

  for (key in io.sockets.connected) {
    io.sockets.connected[key].emit("level", levelControls.slice(players * 4, players * 4 + 4));
    players++;
  }
  sendInstructions();
}

function sendInstructions() {
  for (key in io.sockets.connected) {
    sendNewInstruction(io.sockets.connected[key]);
  }
}

function sendNewInstruction(socket) {
  console.log(players * 4);
  var instructionTxt = "";
  var available = levelControls.slice(0, players * 4);
  var instruction = available[Math.floor(Math.random() * available.length)];
  for (var i = 0; i < pendingInstructions.length; i++) {
    if (pendingInstructions[i].id == instruction.id) {
      sendNewInstruction(socket);
      return;
    }
  }

  instruction.socketID = socket.id;

  switch (instruction.type) {
    case "button":
      instruction.desiredValue = 1;
      instructionTxt = instruction.value + " " + instruction.title;
    break;
    case "toggle":
      instruction.desiredValue = rand(instruction.options.length-1);
      instructionTxt = "Set " + instruction.title + " to " + instruction.options[instruction.desiredValue];
    break;
  }

  socket.emit("instruction", instructionTxt);
  pendingInstructions.push(instruction);

  // countDown = setInterval(function() {
  //    timeLeft--;
  //    io.emit("count", timeLeft);

  //     if (timeLeft <= 0) {
  //       lose();
  //       return;
  //     }
  // }, 1000);
}

initGame();

io.on("connection", function(socket) {
  socket.emit("level", levelControls.slice(players * 4, players * 4 + 4));
  players++;
  sendNewInstruction(socket);
  socket.on("click", function(data) {
    console.log(data);
    for (var i = 0; i < pendingInstructions.length; i++) {
      if (pendingInstructions[i].id == data.control_number && pendingInstructions[i].desiredValue == data.value) {
        io.emit("correct", "");
        correctInstructions++;
        if (correctInstructions > 10) {
          clearTimeout(timeout);
          io.emit("nextLevel", "");
        } else {
          var prevSocket = io.sockets.connected[pendingInstructions[i].socketID];
          pendingInstructions.splice(i, 1);
          sendNewInstruction(prevSocket);
        }
        break;
      }
    }
  });
  socket.on("newgame", function() {
    initGame();
  });
  socket.on("nextLevel", function() {
    initGame();
  });
  socket.on("disconnect", function() {
    console.log("lost a client");
    players--;
  });
  socket.on('reset', function (data) {
    timeLeft = 1000;
    io.emit('timer', timeLeft);
  });
});

function getInstructions() {
  for (var i = 0; i < levelControls.length; i++) {
    var value;
    switch (levelControls[i].type)
    {
      case "toggle":
        value = rand(1);
        break;
      default:
        value = 1;
    }
    levelControls[i].desiredValue = value;
  }
  return levelControls;
}

function lose() {
  clearInterval(countDown);
  io.emit("lose", "");
}

// Fisher-Yates shuffle
function shuffleArray(array) {
  for (var i = 1; i < array.length; i++) {
    var j = Math.floor(Math.random() * array.length);
    var tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
  return array;
}

function rand(i) {
  return Math.round(Math.random() * i);
}
