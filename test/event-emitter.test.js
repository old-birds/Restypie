'use strict';

describe('Restypie.EventEmitter', function () {

  describe('.emit()', function () {
    it('should emit error event', function () {
      let err = null;
      Restypie.EventEmitter.on(Restypie.EventTypes.ERROR, function (error) {
        err = error;
      });
      Restypie.EventEmitter.emit(Restypie.EventTypes.ERROR, new Error('message'));
      err.message.should.equal('message');
    });
  });

});