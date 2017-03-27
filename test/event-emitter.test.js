'use strict';

describe('Restypie.EventEmitter', function () {

  describe('.emit()', function () {
    it('should emit error event', function () {
      let msg = null;
      let err = null;
      Restypie.EventEmitter.on(Restypie.EventTypes.ERROR, function (stack, error) {
        msg = stack;
        err = error;
      });
      Restypie.EventEmitter.emit(Restypie.EventTypes.ERROR, 'message', 'error');
      msg.should.equal('message');
      err.should.equal('error');
    });
  });

});