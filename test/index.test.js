'use strict';

describe('Restypie', function () {

  describe('constructor', function () {

    it('should call getters...', function () {
      Restypie.LIST_SEPARATOR_REG;
      Restypie.Query;
    });

  });

  describe('.listToArray()', function () {
    it('should convert a string list to an array', function () {
      Restypie.listToArray('1,2,3').should.deep.equal(['1', '2', '3']);
      Restypie.listToArray('1,  2,  3').should.deep.equal(['1', '2', '3']);
    });
    it('should return an empty array if no string', function () {
      Restypie.listToArray().should.deep.equal([]);
    });
  });

  describe('.arrayToList()', function () {
    it('should build a list from a array', function () {
      Restypie.arrayToList([1, 2, 3]).should.equal('1,2,3');
    });
    it('should return an empty string', function () {
      Restypie.arrayToList().should.equal('');
    });
  });

  describe('.stringify()', function () {
    it('should stringify object', function () {
      const now = new Date();

      Restypie.stringify({
        filters: {
          foo: { in: ['bar', 'baz'] },
          bool: false,
          date: now,
          int: 1,
          float: 2.34,
          bar: { gte: 1 }
        },
        limit: 10,
        offset: 10,
        sort: ['-bar', 'baz'],
        populate: ['external'],
        select: ['bar', 'baz']
      }).should.deep.equal({ foo__in: 'bar,baz',
        bool: false,
        date: now,
        int: 1,
        float: 2.34,
        bar__gte: 1,
        limit: 10,
        offset: 10,
        populate: 'external',
        select: 'bar,baz',
        sort: '-bar,baz'
      });
    });
  });

  describe('.mergeValuesForOperator()', function () {

    it('should throw if unknown operator', function () {
      (function () {
        Restypie.mergeValuesForOperator('unknown');
      }).should.throw(/operator/);
    });

    describe('in', function () {

      it('should return intersection', function () {
        Restypie.mergeValuesForOperator('in', [1, 2, 3], [3, 4, 5]).should.deep.equal({ in: [3] });
      });

      it('should return an empty array (no intersection)', function () {
        Restypie.mergeValuesForOperator('in', [1, 2, 3], [4, 5]).should.deep.equal({ in: [] });
      });

      it('should return empty array if one of the arrays is empty', function () {
        Restypie.mergeValuesForOperator('in', [1, 2, 3], []).should.deep.equal({ in: [] });
      });

    });

    describe('nin', function () {

      it('should concatenate', function () {
        Restypie.mergeValuesForOperator('nin', [1, 2], [3, 4]).should.deep.equal({ nin: [1, 2, 3, 4] });
      });

      it('should concatenate and unique', function () {
        Restypie.mergeValuesForOperator('nin', [1, 2, 3], [3, 4]).should.deep.equal({ nin: [1, 2, 3, 4] });
      });

      it('should contenate even if empty array', function () {
        Restypie.mergeValuesForOperator('nin', [1, 2, 3, 4], []).should.deep.equal({ nin: [1, 2, 3, 4] });
      });

    });

    describe('eq', function () {
      it('should turn filter into in', function () {
        Restypie.mergeValuesForOperator('eq', 1, 2).should.deep.equal({ in: [1, 2] });
      });
    });

    describe('ne', function () {
      it('should turn filter into nin', function () {
        Restypie.mergeValuesForOperator('ne', 1, 2).should.deep.equal({ nin: [1, 2] });
      });
    });

    describe('gt', function () {
      it('should only keep higher value', function () {
        Restypie.mergeValuesForOperator('gt', 1, 2).should.deep.equal({ gt: 2 });
      });
      it('should keep whatever value if they are the same', function () {
        Restypie.mergeValuesForOperator('gt', 2, 2).should.deep.equal({ gt: 2 });
      });
    });

    describe('gte', function () {
      it('should only keep higher value', function () {
        Restypie.mergeValuesForOperator('gte', 1, 2).should.deep.equal({ gte: 2 });
      });
      it('should keep whatever value if they are the same', function () {
        Restypie.mergeValuesForOperator('gte', 2, 2).should.deep.equal({ gte: 2 });
      });
    });

    describe('lt', function () {
      it('should only keep smaller value', function () {
        Restypie.mergeValuesForOperator('lt', 1, 2).should.deep.equal({ lt: 1 });
      });
      it('should keep whatever value if they are the same', function () {
        Restypie.mergeValuesForOperator('lt', 2, 2).should.deep.equal({ lt: 2 });
      });
    });

    describe('lt', function () {
      it('should only keep smaller value', function () {
        Restypie.mergeValuesForOperator('lte', 1, 2).should.deep.equal({ lte: 1 });
      });
      it('should keep whatever value if they are the same', function () {
        Restypie.mergeValuesForOperator('lte', 2, 2).should.deep.equal({ lte: 2 });
      });
    });

  });

});