'use strict';
angular.module('ngErrorShipper', []).factory('stacktraceService', function () {
  return { print: printStackTrace || {} };
}).provider('$exceptionHandler', {
  $get: [
    'errorLogService',
    function (errorLogService) {
      return errorLogService;
    }
  ]
}).factory('errorLogService', [
  '$log',
  '$window',
  '$timeout',
  'stacktraceService',
  'errorShipper',
  function ($log, $window, $timeout, stacktraceService, errorShipper) {
    function log(exception, cause) {
      $log.error.apply($log, arguments);
      var payload = {};
      payload.exception = exception.toString();
      payload.location = angular.toJson($window.location);
      payload.cause = cause || null;
      payload.performance = angular.toJson(window.performance) || null;
      payload.stacktrace = stacktraceService.print({ e: exception }) || null;
      if (errorShipper.shippers.length) {
        errorShipper.shippers.forEach(function (shipper) {
          $timeout(function () {
            if (typeof shipper === 'function')
              shipper(payload);
          }, 0);
        });
      }
    }
    return log;
  }
]).service('errorShipper', [
  '$http',
  function ($http) {
    var shippers = [];
    var DEFAULTS = { method: 'POST' };
    function use(shipper) {
      shippers.push(shipper);
    }
    function configure(options) {
      finalOptions = angular.extend(DEFAULTS, options);
      if (!finalOptions.url)
        throw new Error('You must specify a URL when using default errorShipper');
      shippers.unshift(function (payload) {
        finalOptions.data = angular.extend(payload, finalOptions.data);
        return $http(finalOptions).success(finalOptions.onSuccess || {}).error(finalOptions.onError || {});
      });
    }
    return {
      use: use,
      configure: configure,
      shippers: shippers
    };
  }
]);