'use strict';

describe('Angular Error Shipper: errorLogService factory', function () {

  var errorLogService,
      logMock,
      shippersMock,
      buildShipperPayloadMock;

  beforeEach(function () {
    module('ngErrorShipper', function ($provide) {
      logMock = jasmine.createSpyObj('$log', ['error']);
      shippersMock = jasmine.createSpyObj('shippers', ['ship']);
      buildShipperPayloadMock = jasmine.createSpy('buildShipperPayload');

      $provide.value('shippers', shippersMock);
      $provide.value('$log', logMock);
      $provide.value('buildShipperPayload', buildShipperPayloadMock);
    });
    
    inject(function(_errorLogService_) {
      errorLogService = _errorLogService_;
    });
  });

  it('should expose a constructor', function () {
    expect(!!errorLogService).toBe(true);
  });

  it('should proxy to the angular logger', function () {
    errorLogService({foo: 'bar'}, 'baz');
    expect(logMock.error).toHaveBeenCalled();
    expect(logMock.error).toHaveBeenCalledWith({foo: 'bar'}, 'baz');
  });

  it('should call the payload builder', function () {
    errorLogService({foo: 'bar'}, 'baz');
    expect(buildShipperPayloadMock).toHaveBeenCalled();
    expect(buildShipperPayloadMock).toHaveBeenCalledWith({foo: 'bar'}, 'baz');
  });

  it('should call the shipper', function () {
    errorLogService({foo: 'bar'}, 'baz');
    expect(shippersMock.ship).toHaveBeenCalled();
  });

});