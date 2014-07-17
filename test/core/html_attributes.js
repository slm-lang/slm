var Lab = require('lab'),
    Template = require('../../lib/template');

var suite   = Lab.experiment;
var before  = Lab.before;
var after   = Lab.after;
var test    = Lab.test
var assert  = Lab.assert

suite('HtmlAttribtues', function() {
  var template;
  before(function(done) {
    template = new Template
    done();
  });

  test('ternary operation in attribute', function(done) {
    var src = "p id=\"${(false ? 'notshown' : 'shown')}\" = this.outputNumber"

    assert.equal(template.eval(src, {outputNumber: 1337}), '<p id="shown">1337</p>');

    done();
  });


  test('ternary operation in attribute 2', function(done) {
    var src = "p id=(false ? 'notshown' : 'shown') = this.outputNumber"

    assert.equal(template.eval(src, {outputNumber: 1337}), '<p id="shown">1337</p>');

    done();
  });


});
