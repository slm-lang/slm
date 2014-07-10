var Lab = require('lab'),
    Filter = require('../lib/filter');

var suite   = Lab.experiment;
var before  = Lab.before;
var after   = Lab.after;
var test    = Lab.test
var assert  = Lab.assert

suite("Filter", function() {

  function FilterWithOnA() {};

  FilterWithOnA.prototype = new Filter;

  FilterWithOnA.prototype.on_a = function() {
    return ['a'];
  };

  FilterWithOnA.prototype.on_a_b = function(z, exp) {
    return ['a', 'b', z];
  };

  function TestFilter() {};
  TestFilter.prototype = new Filter;

  TestFilter.prototype.on_test = function(args) {
    return ['on_test'].concat(args);
  }

  TestFilter.prototype.on_test_check = function(args) {
    return ['on_check'].concat(args);
  }

  TestFilter.prototype.on_second_test = function(args) {
    return ['on_second_test'].concat(args);
  }

  TestFilter.prototype.on_a_b = function(args) {
    return ['on_ab'].concat(args);
  }

  TestFilter.prototype.on_a_b_test = function(args) {
    return ['on_ab_test'].concat(args);
  }

  TestFilter.prototype.on_a_b_c_d_test = function(args) {
    return ['on_abcd_test'].concat(args);
  }

  function InheritedTestFilter() {};

  InheritedTestFilter.prototype = new TestFilter;

  InheritedTestFilter.prototype.on = function(args) {
    return ['on_zero'].concat(args);
  }

  var filter;

  before(function(done) {
    filter = new TestFilter;

    done();
  });

  test("#dispatchedMethods", function(done) {
    var filter = new Filter;
    assert.deepEqual(
      filter.dispatchedMethods(),
      [ 'on_multi',
        'on_capture',
        'on_if',
        'on_case',
        'on_block',
        'on_cond',
        'on_escape' ]
    );

    var filterWithOnA = new FilterWithOnA;

    assert.deepEqual(
      filterWithOnA.dispatchedMethods(),
      [ 'on_a',
        'on_a_b',
        'on_multi',
        'on_capture',
        'on_if',
        'on_case',
        'on_block',
        'on_cond',
        'on_escape' ]
    );

    done();
  });

  test('return unhandled expressions', function(done) {
    assert.deepEqual(filter.exec(['unhandled']), ['unhandled'] );
    done();
  });

  test('dispatch first level', function(done) {
    assert.deepEqual(filter.exec(['test', 42]), ['on_test', 42]);
    done();
  });

  test('dispatch second level', function(done) {
    assert.deepEqual(filter.exec(['second', 'test', 42]), ['on_second_test', 42]);
    done();
  });

  test('dispatch second level if prefixed', function(done) {
    assert.deepEqual(filter.exec(['test', 'check', 42]), ['on_check', 42]);
    done();
  });

  test('dispatch parent level', function(done) {
    console.log(filter.dispatcher.toString());
    assert.deepEqual(filter.exec(['a', 42]), ['a', 42]);
    assert.deepEqual(filter.exec(['a', 'b', 42]), ['on_ab', 42]);
    assert.deepEqual(filter.exec(['a', 'b', 'test', 42]), ['on_ab_test', 42]);
    assert.deepEqual(filter.exec(['a', 'b', 'c', 42]), ['on_ab', 'c', 42]);
    assert.deepEqual(filter.exec(['a', 'b', 'c', 'd', 42]), ['on_ab', 'c', 'd', 42]);
    assert.deepEqual(filter.exec(['a', 'b', 'c', 'd', 'test', 42]), ['on_abcd_test', 42]);
    done();
  });
});
