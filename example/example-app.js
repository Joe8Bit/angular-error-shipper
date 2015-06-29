// Below is an incredibly naive Angular application, built to demonstrate how to use, in it's simplest
// form, the angular-error-shipper module

var app = angular.module('exampleShipperApp', [
  'ngRoute',
  'ngErrorShipper' // <-- our error shipper dependency
]);

app.config(['$routeProvider', function($routeProvider) {
  // Setup some routes for the example, nont are required for the shipper to work outside of the
  // example
  $routeProvider
    .when('/', {
      templateUrl: 'partials/home.html', 
      controller: 'HomeCtrl'
    })
    .when('/throw-error', {
      templateUrl: 'partials/throw-error.html', 
      controller: 'ErrorCtrl'
    })
    .when('/custom-shipper', {
      templateUrl: 'partials/throw-error.html', 
      controller: 'CustomShipperCtrl'
    });
}]);

app.controller('HomeCtrl', function($log, errorShipper) {

  // Configure our default shipper
  errorShipper.configure({
    url: '/this/url/will/404',
    onError: function() {
      $log.error('This example will always reach here, as there is no service to return a 20x');
    }
  });

  // Configure a custom shipper
  errorShipper.use(function(payload) {
    $log.warn(payload);
  });
});

app.controller('ErrorCtrl', function($scope) {
  // This will throw an error, as the object and property doesn't exist!
  $scope.doesnt.exist = 'throw';
});
