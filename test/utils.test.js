'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
let Utils = Restypie.Utils;


describe('Utils', function () {

  it('should exist', function () {
    should.exist(Utils);
  });

  describe('.iSubclassOf', function () {

    it('should recognize Child as a subclass of Parent', function () {
      class Parent {}
      class Child extends Parent {}
      Utils.isSubclassOf(Child, Parent).should.equal(true);
    });

    it('should not recognize Child as a subclass of Parent', function () {
      class Parent {}
      class Child {}
      Utils.isSubclassOf(Child, Parent).should.equal(false);
    });

    it('should throw if Child is not a subclass of Parent', function () {
      class Parent {}
      class Child {}
      (function () {
        Utils.isSubclassOf(Child, Parent, true);
      }).should.throw(/subclass/);
    });

    it('should not throw if Child is a subclass of Parent', function () {
      class Parent {}
      class Child extends Parent{}
      (function () {
        Utils.isSubclassOf(Child, Parent, true);
      }).should.not.throw();
    });

  });

  describe('.isInstanceOf', function () {

    it('should recognize obj as an instance of Parent', function () {
      class Parent {}
      Utils.isInstanceOf(new Parent(), Parent).should.equal(true);
    });

    it('should not recognize obj as an instance of Parent', function () {
      class Parent {}
      Utils.isInstanceOf({}, Parent).should.equal(false);
    });

    it('should throw if obj is not an instance of Parent', function () {
      class Parent {}
      (function () {
        Utils.isInstanceOf({}, Parent, true);
      }).should.throw(/instance/);
    });

    it('should not throw if obj is an instance of Parent', function () {
      class Parent {}
      (function () {
        Utils.isInstanceOf(new Parent(), Parent, true);
      }).should.not.throw();
    });

  });

  describe('.isNone', function () {

    it('"null" should be none', function () {
      Utils.isNone(null).should.equal(true);
    });

    it('"undefined" should be none', function () {
      Utils.isNone(undefined).should.equal(true);
    });

    it('"NaN" should be none', function () {
      Utils.isNone(NaN).should.equal(false);
    });

    it('"" (empty string) should not be none', function () {
      Utils.isNone('').should.equal(false);
    });

    it('"false" should not be none', function () {
      Utils.isNone(false).should.equal(false);
    });

    it('"0" should not be none', function () {
      Utils.isNone(0).should.equal(false);
    });

  });

  describe('.didReturnAPromise', function () {

    it('should return true', function () {
      Utils.didReturnAPromise((function () {
        return Promise.resolve();
      })()).should.equal(true);
    });

    it('should return false', function () {
      Utils.didReturnAPromise((function () {
        return 'foo';
      })()).should.equal(false);
    });

    it('should return false', function () {
      Utils.didReturnAPromise((function () {
        return null;
      })()).should.equal(false);
    });

    it('should return false', function () {
      Utils.didReturnAPromise((function () {
        return function () {};
      })()).should.equal(false);
    });

  });

  describe('.forceAbstract', function () {

    class Abstract {
      constructor(options) {
        Utils.forceAbstract(this, Abstract);
        this.options = options;
      }
    }

    class Child extends Abstract {
      constructor(options, anotherParameter) {
        super(options);
        this.anotherParameter = anotherParameter;
      }
    }

    it('should not instantiate an abstract class', function () {
      (function () {
        new Abstract({});
      }).should.throw(/abstract/);
    });

    it('should instantiate an derived class', function () {
      let child;
      (function () {
        child = new Child({}, 'foo');
      }).should.not.throw();
      child.options.should.be.an('object');
      child.anotherParameter.should.equal('foo');
    });

  });

  describe('.forceStatic', function () {

    class Static {
      constructor() {
        Utils.forceStatic(this, Static);
      }
      static sayHello() {
        return 'Hello';
      }
    }

    class Child extends Static {
    }

    it('should not instantiate a static class', function () {
      (function () {
        new Static();
      }).should.throw(/static/);
    });

    it('should not instantiate a static subclass', function () {
      (function () {
        new Child();
      }).should.throw(/static/);
    });

    it('static methods should remain callable', function () {
      Static.sayHello().should.equal('Hello');
      Child.sayHello().should.equal('Hello');
    });

  });

  describe('.missingImplementation', function () {

    class Base {
      get foo() { return Utils.missingImplementation('foo'); }
    }

    class Right extends Base {
      foo() {}
    }

    class Wrong extends Base {

    }

    it('should NOT throw an error if function is redefined', function () {
      (new Right().foo());
    });

    it('should throw an error if function is not redefined', function () {
      (new Wrong().foo).should.throw(/implement/);
    });

  });

});