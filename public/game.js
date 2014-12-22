var app = angular.module("space", []);
app.controller("gameCtrl", ["$scope", function($scope) {
  $scope.foo = "bar";
  $scope.screen = "instructions";

  var socket = io("http://localhost:8009/");
  socket.on('instruction', function(data) {
    $scope.instruction = data;

    // Force animation
    $scope.newInstruction = false;
    $scope.$apply();
    $scope.newInstruction = true;
    $scope.$apply();
  });

  socket.on('level', function(data) {
    $scope.level = data;
    $scope.$apply();
  });

  socket.on('correct', function(data) {
    console.log("Yep");
  });

  socket.on('nextLevel', function(data) {
    $scope.screen = "splash";
    $scope.newInstruction = "";
    $scope.$apply();
  });

  socket.on('lose', function(data) {
    $scope.screen = "lose";
    $scope.newInstruction = "";
    $scope.$apply();
  });

  $scope.change = function(control_number, value) {
    socket.emit("click", { control_number: control_number, value: value });
  }

  $scope.startNewGame = function() {
    socket.emit("newgame");
    $scope.screen = "instructions";
  }

  $scope.nextLevel = function() {
    socket.emit("nextLevel");
    $scope.screen = "instructions";
  }
}]);
