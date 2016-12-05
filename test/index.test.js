'use strict';

describe('Restypie', function () {

  describe('constructor', function () {

    it('should call getters...', function () {
      Restypie.LIST_SEPARATOR_REG;
      Restypie.Query;
    });

  });

  describe('.isSupportedRouterType()', function() {

    it('should return false', function () {
      Restypie.isSupportedRouterType('foo').should.equal(false);
    });

    it('should return true', function () {
      Restypie.isSupportedRouterType(Restypie.RouterTypes.EXPRESS).should.equal(true);
    });

  });

  describe('.assertSupportedRouterType()', function() {

    it('should throw', function () {
      (function () {
        Restypie.assertSupportedRouterType('foo');
      }).should.throw(/routerType/);
    });

    it('should NOT throw', function () {
      (function () {
        Restypie.assertSupportedRouterType(Restypie.RouterTypes.EXPRESS);
      }).should.not.throw();
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
    it('should return str if it s an array', function () {
      const arr = [1, 2, 3];
      Restypie.listToArray(arr).should.equal(arr);
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
          bar: { gte: 1 },
          null: null,
          arrayWithNullAndUndefined: { in: [null, undefined] },
          undefined: undefined
        },
        limit: 10,
        offset: 10,
        sort: ['-bar', 'baz'],
        populate: ['external'],
        select: ['bar', 'baz'],
        options: ['noCount']
      }).should.deep.equal({
        foo__in: 'bar,baz',
        bool: false,
        date: now,
        int: 1,
        float: 2.34,
        bar__gte: 1,
        limit: 10,
        offset: 10,
        populate: 'external',
        select: 'bar,baz',
        sort: '-bar,baz',
        options: 'noCount',
        null: 'null',
        undefined: 'undefined',
        arrayWithNullAndUndefined__in: 'null,undefined'
      });
    });
  });

  describe('.mergeValuesForOperator()', function () {

    it('should throw if unknown operator', function () {
      (function () {
        Restypie.mergeValuesForOperator('unknown', 1, 2);
      }).should.throw(/operator/);
    });

    it('should return an empty object if no values', function () {
      Restypie.mergeValuesForOperator('unknown').should.deep.equal({});
    });

    describe('in', function () {

      it('should return intersection', function () {
        Restypie.mergeValuesForOperator('in', [1, 2, 3], [3, 4, 5]).should.deep.equal({ eq: 3 });
      });

      it('should return an empty array (no intersection)', function () {
        Restypie.mergeValuesForOperator('in', [1, 2, 3], [4, 5]).should.deep.equal({ in: [] });
      });

      it('should return empty array if one of the arrays is empty', function () {
        Restypie.mergeValuesForOperator('in', [1, 2, 3], []).should.deep.equal({ in: [] });
      });

      it('should map to `eq` if only one value', function () {
        Restypie.mergeValuesForOperator('in', [1], [1]).should.deep.equal({ eq: 1 });
      });

    });

    describe('nin', function () {

      it('should concatenate', function () {
        Restypie.mergeValuesForOperator('nin', [1, 2], [3, 4]).should.deep.equal({ nin: [1, 2, 3, 4] });
      });

      it('should concatenate and unique', function () {
        Restypie.mergeValuesForOperator('nin', [1, 2, 3], [3, 4]).should.deep.equal({ nin: [1, 2, 3, 4] });
      });

      it('should concatenate even if empty array', function () {
        Restypie.mergeValuesForOperator('nin', [1, 2, 3, 4], []).should.deep.equal({ nin: [1, 2, 3, 4] });
      });

      it('should map to `ne` if only one value', function () {
        Restypie.mergeValuesForOperator('nin', [1], [1]).should.deep.equal({ ne: 1 });
      });

    });

    describe('eq', function () {
      it('should turn filter into empty in', function () {
        Restypie.mergeValuesForOperator('eq', 1, 2).should.deep.equal({ in: [] });
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

  describe('mergeFiltersForKey()', function () {

    it('should correctly merge filters', function () {
      const left = {
        leftOnly: { gt: 0 },
        contradictory: { eq: 1 },
        inExcluding: { in: [1, 2] },
        inIncluding: { in: [1, 2] },
        ninIncluding: { nin: [1, 2] },
        eq: { eq: 1 },
        reMerge: { ne: 1, nin: [2, 3] },
        fancy1: { gte: 60, eq: 0 },
        excludeAll: { in: [], gt: 15 },
        inToEq: { in: [1] },
        removingNe: { in: [1, 2, 3] },
        unusedNin: { nin: [] }
      };

      const right = {
        rightOnly: { lt: 0 },
        contradictory: { ne: 1 },
        inExcluding: { in: [3, 4] },
        inIncluding: { in: [2, 3] },
        ninIncluding: { nin: [3, 4] },
        eq: { eq: 2 },
        reMerge: { ne: 2 },
        fancy1: { gte: 15, in: [3, 4, 5], ne: 3, nin: [4, 5] },
        excludeAll: { gt: 16 },
        removingNe: { ne: 3 },
        sameIds: { in: [1, 1] }
      };

      const final = {
        leftOnly: { gt: 0 },
        rightOnly: { lt: 0 },
        contradictory: { in: [] },
        inExcluding: { in: [] },
        inIncluding: { eq: 2 },
        ninIncluding: { nin: [1, 2, 3, 4] },
        eq: { in: [] },
        reMerge: { nin: [1, 2, 3] },
        fancy1: { gte: 60, in: [], nin: [4, 5, 3] },
        excludeAll: { in: [] },
        inToEq: { eq: 1 },
        removingNe: { in: [1, 2], ne: 3 },
        unusedNin: {},
        sameIds: { eq: 1 }
      };

      Restypie.mergeFilters(left, right).should.deep.equal(final);
    });
  });

});



























