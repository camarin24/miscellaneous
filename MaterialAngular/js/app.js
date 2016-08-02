angular.module( 'YourApp', [ 'ngMaterial' ] )
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('pink')
    .accentPalette('orange');
}).controller("YourController", function ($scope) {

} );
