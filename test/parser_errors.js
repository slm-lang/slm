var Lab = require('lab'),
    Parser = require('../lib/parser');

var suite   = Lab.experiment;
var before  = Lab.before;
var after   = Lab.after;
var test    = Lab.test
var assert  = Lab.assert

suite("Parser errors", function() {

  test("correct filename", function(done) {

    var source =
      "doctype 5" +
      "  div Invalid";

    

    done();
  });
});
