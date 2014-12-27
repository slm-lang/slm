var Lab = require('lab');
var Filter = require('../lib/filter');
var assert  = require('chai').assert;

var lab = exports.lab = Lab.script();

lab.experiment('Filter', function() {

  function FilterWithOnA() {}
  FilterWithOnA.prototype = new Filter();
  (function() {
    this.on_a = function() {
      return ['a'];
    };

    this.on_a_b = function(exps) {
      return ['a', 'b', exps[2]];
    };
  }).apply(FilterWithOnA.prototype);

  function TestFilter() {}
  TestFilter.prototype = new Filter();
  (function() {
    this.on_test = function(exps) {
      return ['on_test'].concat(exps[1]);
    };

    this.on_test_check = function(exps) {
      return ['on_check'].concat(exps[2]);
    };

    this.on_second_test = function(exps) {
      return ['on_second_test'].concat(exps[2]);
    };

    this.on_a_b = function(exps) {
      exps.shift();
      exps.shift();
      return ['on_ab'].concat(exps);
    };

    this.on_a_b_test = function(exps) {
      return ['on_ab_test'].concat(exps[3]);
    };

    this.on_a_b_c_d_test = function(exps) {
      return ['on_abcd_test'].concat(exps[5]);
    };
  }).apply(TestFilter.prototype);

  function InheritedTestFilter() {}
  InheritedTestFilter.prototype = new TestFilter();

  InheritedTestFilter.prototype.on = function(args) {
    return ['on_zero'].concat(args);
  };

  var filter;

  lab.before(function(done) {
    filter = new TestFilter();
    done();
  });

  lab.test('#dispatchedMethods', function(done) {
    var filter = new Filter();
    assert.deepEqual(
      filter._dispatchedMethods(),
      [ 'on_multi',
        'on_capture',
        'on_if',
        'on_switch',
        'on_block',
        'on_escape' ]
    );

    var filterWithOnA = new FilterWithOnA();

    assert.deepEqual(
      filterWithOnA._dispatchedMethods(),
      [ 'on_a',
        'on_a_b',
        'on_multi',
        'on_capture',
        'on_if',
        'on_switch',
        'on_block',
        'on_escape' ]
    );

    done();
  });

  lab.test('return unhandled expressions', function(done) {
    assert.deepEqual(filter.exec(['unhandled']), ['unhandled'] );
    done();
  });

  lab.test('dispatch first level', function(done) {
    assert.deepEqual(filter.exec(['test', 42]), ['on_test', 42]);
    done();
  });

  lab.test('dispatch second level', function(done) {
    assert.deepEqual(filter.exec(['second', 'test', 42]), ['on_second_test', 42]);
    done();
  });

  lab.test('dispatch second level if prefixed', function(done) {
    assert.deepEqual(filter.exec(['test', 'check', 42]), ['on_check', 42]);
    done();
  });

  lab.test('dispatch parent level', function(done) {
    assert.deepEqual(filter.exec(['a', 42]), ['a', 42]);
    assert.deepEqual(filter.exec(['a', 'b', 42]), ['on_ab', 42]);
    assert.deepEqual(filter.exec(['a', 'b', 'test', 42]), ['on_ab_test', 42]);
    assert.deepEqual(filter.exec(['a', 'b', 'c', 42]), ['on_ab', 'c', 42]);
    assert.deepEqual(filter.exec(['a', 'b', 'c', 'd', 42]), ['on_ab', 'c', 'd', 42]);
    assert.deepEqual(filter.exec(['a', 'b', 'c', 'd', 'test', 42]), ['on_abcd_test', 42]);
    done();
  });
});
