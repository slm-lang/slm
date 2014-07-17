var Lab   = require('lab'),
    Utils = require('../lib/utils');

var suite   = Lab.experiment;
var before  = Lab.before;
var after   = Lab.after;
var test    = Lab.test
var assert  = Lab.assert

suite("Utils", function() {

  test("rejectEmpty", function(done) {
    assert.deepEqual(Utils.rejectEmpty(['a', null, 'b', '', 'c']), ['a', 'b', 'c']);
    done();
  });
});
