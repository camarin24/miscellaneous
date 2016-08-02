var app = angular.module("comentarios",[]);
app.controller("cometariosController",function($scope,$http){
  $scope.nombre = "hello";
  $scope.nuevoComentario = {};
  $scope.comentarios = [
    {
      comentario:"Buen trabajo",
      user:"tupapitomk"
    },
    {
      comentario:"good job",
      user:"hello moto"
    }
  ];
  $scope.agregarCometario = function(){
    $scope.comentarios.push($scope.nuevoComentario);
    $scope.nuevoComentario = {};
  }
  $http({
  method: 'GET',
  url: 'http://webservice-camarin.rhcloud.com/user'
}).then(function successCallback(response) {
    $scope.users = response.data;
  }, function errorCallback(response) {
    console.log("error",response);
  });
})
