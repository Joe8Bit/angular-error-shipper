'use strict';

describe('Angular Error Shipper: buildShipperPayload factory', function () {

  var buildShipperPayload;

  beforeEach(function () {
    module('ngErrorShipper');
    
    inject(function(_buildShipperPayload_) {
      buildShipperPayload = _buildShipperPayload_;
    });
  });

  it('should expose a constructor', function () {
    expect(!!buildShipperPayload).toBe(true);
  });

  it('should correctly return data assuming its passed all arguments', function () {
    var payload = buildShipperPayload(new TypeError('undefined is not a function'), 'FOOBAR');
    expect(payload.exception).toBe('TypeError: undefined is not a function');
    expect(typeof payload.stack).toBe('string');
    expect(payload.stack.length > 0).toBeTruthy();
    expect(payload.cause).toBe('FOOBAR');
    expect(typeof payload.location).toBe('string');
    expect(JSON.parse(payload.location).port).toBe('9876');
    expect(typeof payload.performance).toBe('string');
    expect(payload.performance.length > 0).toBeTruthy();
  });

  it('should correctly return data assuming not all of its arguments are defined', function () {
    var payload = buildShipperPayload(new TypeError('undefined is not a function'));
    expect(payload.exception).toBe('TypeError: undefined is not a function');
    expect(typeof payload.stack).toBe('string');
    expect(payload.stack.length > 0).toBeTruthy();
    expect(payload.cause).toBe(null);
    expect(typeof payload.location).toBe('string');
    expect(JSON.parse(payload.location).port).toBe('9876');
    expect(typeof payload.performance).toBe('string');
    expect(payload.performance.length > 0).toBeTruthy();
  });

});