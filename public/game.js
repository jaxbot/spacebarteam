var app = angular.module("space", []);
app.controller("gameCtrl", ["$scope", function($scope) {
  $scope.foo = "bar";

  var socket = io("http://localhost:8009/");
  socket.on('instruction', function(data) {
    console.log(data);
  });

  socket.on('level', function(data) {
    $scope.level = data;
    $scope.$apply();
  });

  socket.on('correct', function(data) {
    console.log("Yep");
  });

  $scope.change = function(control_number, value) {
    socket.emit("click", { control_number: control_number, value: value });
  }
}]);
