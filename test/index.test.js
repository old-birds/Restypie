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

});