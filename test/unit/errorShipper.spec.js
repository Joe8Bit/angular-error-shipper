'use strict';

describe('Angular Error Shipper: errorShipper service', function () {

  var shippersMock,
      errorShipper;

  beforeEach(function () {
    module('ngErrorShipper', function ($provide) {
      shippersMock = jasmine.createSpyObj('shippers', ['set', 'get']);
      $provide.value('shippers', shippersMock);
    });
    
    inject(function(_errorShipper_) {
      errorShipper = _errorShipper_;
    });
  });

  it('should expose a constructor', function () {
    expect(!!errorShipper).toBe(true);
  });

  it('should expose a use method that adds custom middleware to the shippers datastore', function () {
    errorShipper.use(function (foo) {});
    expect(shippersMock.set).toHaveBeenCalledWith(jasmine.any(Function));
  });

  it('should expose a configure method that correctly sets the default shipper', function () {
    errorShipper.configure({
      url: '/foo/bar'
    });
    expect(shippersMock.set).toHaveBeenCalledWith(jasmine.any(Function), true);
  });

  it('should expose a configure method that properly sets the $http options', function () {
    expect(errorShipper._options()).toBeUndefined();
    errorShipper.configure({
      url: '/foo/bar'
    });
    expect(errorShipper._options()).toEqual({
      url: '/foo/bar',
      method: 'POST'
    });
  });

  it('should expose a configure method that properly overrides the default options', function () {
    expect(errorShipper._options()).toBeUndefined();
    errorShipper.configure({
      url: '/foo/bar',
      method: 'PATCH'
    });
    expect(errorShipper._options()).toEqual({
      url: '/foo/bar',
      method: 'PATCH'
    });
  });

  it('should expose a configure method that correctly throws an error if no URL option is set', function () {
    expect(function(){ errorShipper.configure(); }).toThrow(new Error('You must specify a URL when using default errorShipper'));
  });

});