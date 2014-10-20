'use strict';
angular.module('ngErrorShipper', []).provider('$exceptionHandler', {
  $get: [
    'errorLogService',
    function (errorLogService) {
      return errorLogService;
    }
  ]
}).factory('errorLogService', [
  '$log',
  'shippers',
  'buildShipperPayload',
  function ($log, shippers, buildShipperPayload) {
    return function (exception, cause) {
      $log.error.apply($log, arguments);
      shippers.ship(buildShipperPayload(exception, cause));
    };
  }
]).factory('buildShipperPayload', [
  '$window',
  function ($window) {
    return function (exception, cause) {
      return {
        exception: exception.toString(),
        stack: exception.stack.toString(),
        location: angular.toJson($window.location),
        cause: cause || null,
        performance: angular.toJson(window.performance)
      };
    };
  }
]).service('shippers', function () {
  var shippers = [];
  function set(shipper, first) {
    if (!first) {
      shippers.push(shipper);
    } else {
      shippers.unshift(shipper);
    }
  }
  function get() {
    return shippers;
  }
  function ship(payload) {
    shippers.forEach(function (shipper) {
      if (typeof shipper === 'function')
        shipper(payload);
    });
  }
  return {
    set: set,
    get: get,
    ship: ship
  };
}).service('errorShipper', [
  '$http',
  'shippers',
  function ($http, shippers) {
    var finalOptions;
    var DEFAULTS = { method: 'POST' };
    function use(shipper) {
      shippers.set(shipper);
    }
    function configure(options) {
      finalOptions = angular.extend(DEFAULTS, options);
      if (!finalOptions.url)
        throw new Error('You must specify a URL when using default errorShipper');
      shippers.set(function (payload) {
        finalOptions.data = angular.extend(payload, finalOptions.data);
        $http(finalOptions).success(finalOptions.onSuccess || {}).error(finalOptions.onError || {});
      }, true);
    }
    function getOptions() {
      return finalOptions;
    }
    return {
      use: use,
      configure: configure,
      _options: getOptions
    };
  }
]);