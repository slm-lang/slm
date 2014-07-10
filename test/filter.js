var Lab = require('lab'),
    Filter = require('../lib/filter');

var suite   = Lab.experiment;
var before  = Lab.before;
var after   = Lab.after;
var test    = Lab.test
var assert  = Lab.assert

suite("Filter", function() {

  function FilterWithOnA() {
  };

  FilterWithOnA.prototype = new Filter;

  FilterWithOnA.prototype.on_a = function() {
    return ['a'];
  };

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
});
