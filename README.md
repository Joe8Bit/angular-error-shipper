## angular-error-shipper

> A module for shipping errors, stack traces and other information from within your Angular app to a remote service.

![Travis Build](https://api.travis-ci.org/Joe8Bit/angular-error-shipper.svg)
![NPM version](https://badge.fury.io/js/angular-error-shipper.svg)
![GitHub version](https://badge.fury.io/gh/Joe8bit%2Fangular-error-shipper.svg)
![Bower version](https://badge.fury.io/bo/angular-error-shipper.svg)
![Dependencies](https://david-dm.org/Joe8Bit/angular-error-shipper.png)

##### Why?
Surfacing the details of when and why your app is breaking is important, this is a tool in assisting in that process. Having these logs indexed in something like LogStash make diagnosing problems significantly easier.

##### How?
This module instruments Angular's default `$exceptionHandler` to invoke a configurable set of clientside shippers.

--

### Usage

Install the module and expose make it accessible to your app (by adding it to the your `index.html`, for example).

```
bower install angular-error-shipper
or
npm install angular-error-shipper
```

Declare the module as a dependency in your app:

```javascript
angular.module('myApp', [
  'ngCookies',
  'ipCookie',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngTouch',
  'ngErrorShipper' // <-- the dep
])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });      
 
  }]);
```

There is a very simple example implementation in the `./example` directory.

### Default Shipper

Just doing the above will not have any effect (the Angular exception handling will work as normal) you will need to configure at least one shipper. There is a default shipper than easily be configured, like so:

```javascript
angular.module('myApp', []).service('myService', function (errorShipper) {
	errorShipper.configure({
		url: 'path/where/it/should/post' // URL is the only required property
	});
});
```

The above is all you need to use the barebones shipper and have a information about clientside exceptions `POST`'d to the specified endpoint. The default shipper will not be created unless your explicitly invoke the `.configure` method.

#### Options for the default shipper

* `url` **required** - An absolute or relative path to the location where the shipper will `POST` exceptions.
* `onSuccess` - A callback to execute when a success `POST` of a exception takes place.
* `onError` - A callback to execute when there is an error on `POST`'ing to the specified `url`.
* `data` - An object that will be merged together with the exception data and be sent to the specified `url`, useful for sending app or user specific information. **Note**: you can also overwrite the properties set internally by the errorLogger.
* `method` - Should you want to use anything other than `POST` for sending the exceptions.

**Note**: this options object is the one that is passed to Angular's internal `$http`, so you can pass it anything you can use there, like `headers` or `cache` etc. See more here:

[https://docs.angularjs.org/api/ng/service/$http](https://docs.angularjs.org/api/ng/service/$http)

### Custom Shippers
If the above default shipper isn't flexible enough for you, you can add an arbitrary number of your own custom shippers to be invoked.

```javascript
angular.module('myApp', []).service('myService', function (errorShipper) {
	errorShipper.use(function (payload) {
		// do something with payload
	});
	errorShipper.use(function (payload) {
		// do something else with payload
	});
});
```
The function(s) you pass to the `use` method will be invoked in the order it was added.

Each shipper will receive the same single argument, an `Object` containing all the information the error instrumentation produces. See `Data format` below for more details.

You will note there's no callback passed from the error instrumenter, as these shippers are designed to be fire-and-forget.

Also, if `configure` is not called and `use` is then **ONLY** the custom shippers will be used.

The default shipper needs to be explicitly opt'ed into. It can be used with an arbitrary number of customer shippers however. When used with custom shippers the default shipper will **always** be executed first, even if `configure` is invoked **AFTER** `use`.

### Data format
The data format is the following:

```javascript
{
   exception : exception.toString(), // Generated by Angular
   stack : exception.stack.toString(), // Generated by Angular
   location : angular.toJson($window.location),
   cause : cause || null, // Generated by Angular
   performance : angular.toJson(window.performance) // If available
}
```
--

### Testing
Run the tests using grunt:

```
grunt test
```

### Contributing
Always welcome, please unit test all your code.

--

### Versions

#####0.1.0 - Initial release