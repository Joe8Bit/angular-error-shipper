/*globals printStackTrace:true, _gaq*/
'use strict';

angular.module('ngErrorShipper', [])
  .provider('$exceptionHandler', {
    /* 
    * By default, AngularJS will catch errors and log them to the Console. We 
    * want to keep that behavior; however, we want to intercept it so that we
    * can run our own middleware
    */
    $get: function (errorLogService) {
      return errorLogService;
    }
  })
  .factory('errorLogService', function ($log, shippers, buildShipperPayload) {
    return function (exception, cause) {
      // Pass off the error to the default error handler on the AngualrJS logger. This will output the
      // error to the console (and let the applicationmkeep running normally for the user).
      $log.error.apply($log, arguments);
      // Invoke our payload
      shippers.ship(buildShipperPayload(exception, cause));
    }
  })
  .factory('buildShipperPayload', function ($window) {
    return function (exception, cause) {
      return {
        exception   : exception.toString(),
        stack       : exception.stack.toString(),
        location    : angular.toJson($window.location),
        cause       : cause || null,
        performance : angular.toJson(window.performance) // TODO: Be more defensive with window.performance
      };
    }
  })
  .service('shippers', function () {
    var shippers = [];

    /**
     * The shippers setter, takes a function and adds it into the shippers manigfest
     * @param {Function} shipper A function that takes a single argument, the error payload
     * @param {Boolean} first   Whether the function passed to it should be added at the first index of the shippers array
     */
    function set ($window, shipper, first) {
      if (!first) {
        shippers.push(shipper);
      } else {
        shippers.unshift(shipper);
      }
    }

    /**
     * The shippers getter, which returns the current shippers manifest
     * @return {Array} An array of the current shippers
     */
    function get () {
      return shippers;
    }

    /**
     * Ship the payload to all shippers in the manifest
     * @param  {Object} payload The payload to be pushed into the shippers
     */
    function ship (payload) {
      shippers.forEach(function (shipper) {
        if (typeof shipper === 'function') shipper(payload);
      });
    }

    return {
      set: set,
      get: get,
      ship: ship
    };
  })
  .service('errorShipper', function ($http, shippers) {

    var finalOptions;
    var DEFAULTS = {
      method: 'POST'
    };

    /**
     * Custom shipper injection, pushes custom middleware into the shipper queue
     * @param  {Function} shipper A function that takes a single argument, the payload
     * @example
     *   errorShipper.use(function (payload) {
     *     // ... do something with the payload
     *   });
     */
    function use (shipper) {
      shippers.set(shipper);
    }

    /**
     * This method sets the conditions to use the built in shipper
     * @param  {Object} options An object containing the configuration for the shipper (see @example below)
     * @example
     *   // The config object can take any arguments that can normally be passed into the options object of
     *   // Angular's $http, so cookies/headers etc etc
     *   // It can also take two EXTRA options, an onSuccess and an onError callback, which are invoked
     *   // depending ont he success of the $http request
     *   errorShipper.configure({
     *     url: '/logger/', // The only REQUIRED property
     *
     *     onSuccess: function () {},
     *     onError: function () {},
     * 
     *     method: 'POST', // defaults to POST
     *     data: { // This object will be merged into the stacktrace info
     *       someArbitaratData: 'foobar'
     *     }
     *   });
     */
    function configure (options) {
      // Merge user specified options with our DEFAULT's 
      finalOptions = angular.extend(DEFAULTS, options);

      // Make sure we throw here if the user doesn't specify and endpoint to use
      if (!finalOptions.url) throw new Error('You must specify a URL when using default errorShipper');

      // Push the default shipper into the first index in our shippers array
      shippers.set(function (payload) {
        // Merge log data with any custom user supplied data
        finalOptions.data = angular.extend(payload, finalOptions.data);
        // Send it! And place any custom callbacks the user might have
        $http(finalOptions).success(finalOptions.onSuccess || {}).error(finalOptions.onError || {});
      }, true);
    }

    /**
     * Returns the current state of the configured options for the default shipper
     * @return {Object} The options object
     */
    function getOptions () {
      return finalOptions;
    }

    return {
      use : use,
      configure: configure,
      _options: getOptions
    };
  });
 