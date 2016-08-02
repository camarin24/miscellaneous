var app = angular.module("log",[]);
app.controller("logs",function($scope,$http){

  setInterval(function(){
    $scope.getLogs();
  },10000)

  $scope.getLogs = function(){
    $http({
    method: 'POST',
    url: 'http://deparchecom.esy.es/webservice/getLogs'
  }).then(function successCallback(response) {
      $scope.logs = response.data;
      console.log($scope.logs);
    }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });
  };
    $scope.getLogs();
})
