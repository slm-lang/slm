var Lab   = require('lab'),
    Utils = require('../lib/utils');

var suite   = Lab.experiment;
var before  = Lab.before;
var after   = Lab.after;
var test    = Lab.test
var assert  = Lab.assert

suite("Utils", function() {

  test("rejectEmpty", function(done) {
    assert.deepEqual(
      Utils.rejectEmpty(['a', null, 'b', '', 'c']),
      ['a', 'b', 'c']
    );
    done();
  });

  test("flatten", function(done) {
    assert.deepEqual(
      Utils.flatten([1, [2, 3], [4, [5, [6, 7]]]]),
      ['1', '2', '3', '4', '5', '6', '7']
    );

    assert.deepEqual(
      Utils.flatten([1, 2, [3], [4, [5, 6], 7], [8, 9]]),
      ['1', '2', '3', '4', '5', '6', '7', '8', '9']
    );

    assert.deepEqual(
      Utils.flatten([1, 2, [], [3, [4, 5, []], 6]]),
      ['1', '2', '3', '4', '5', '6']
    );
    done();
  });
});
