'use strict';

describe('Angular Error Shipper: shippers service', function () {

  var shippers;

  beforeEach(function () {
    module('ngErrorShipper');
    
    inject(function(_shippers_) {
      shippers = _shippers_;
    });
  });

  it('should expose a constructor', function () {
    expect(!!shippers).toBe(true);
  });

  it('should set a shipper middleware into the shipper manifest', function () {
    var shipper = function (blork) { return blork };
    shippers.set(shipper);
    expect(shippers.get().length).toBe(1);
    expect(shippers.get()[0].toString()).toBe(shipper.toString());
  });

  it('should set a as the first index when true passed as second argument', function () {
    var shipper = function (blork) { return blork };
    var shipper2 = function (baz) { return baz };
    shippers.set(shipper);
    shippers.set(shipper2, true);

    expect(shippers.get().length).toBe(2);
    expect(shippers.get()[0].toString()).toBe(shipper2.toString());
    expect(shippers.get()[1].toString()).toBe(shipper.toString());
  });

  it('should invoke a single shipper with the correct payload', function () {
    var payload = { foo: 'bar' },
        shipper1 = function (payload) { expect(payload).toEqual(payload) };
    shippers.set(shipper1);
    shippers.ship(payload);
  });

  it('should invoke multiple shippers with the same correct payload', function () {
    var shipper1 = function (payload) { expect(payload).toEqual({foo: 'bar'}) };
    var shipper2 = function (payload) { expect(payload).toEqual({foo: 'bar'}) };
    var shipper3 = function (payload) { expect(payload).toEqual({foo: 'bar'}) };
    shippers.set(shipper1);
    shippers.set(shipper2);
    shippers.set(shipper3);
    shippers.ship({foo: 'bar'});
  });

  it('should not throw an error if ship is called when no shippers are defined', function () {
    // THis looks like a mistake, but the spec will automatically fail if an exception is thrown
    // e.g. jasmine essentialy wraps every statement in a expect().not.toThrowException(), so if this
    // function does throw, then the test will fail!
    shippers.ship({foo: 'bar'});
  });

});