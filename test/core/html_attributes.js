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

  test('class attribute merging', function(done) {
    var src = '.alpha class="beta" Test it'

    assert.equal(template.eval(src, {}), '<div class="alpha beta">Test it</div>');

    done();
  });

  test('class attribute merging with null', function(done) {
    var src = '.alpha class="beta" class=null class="gamma" Test it';

    assert.equal(template.eval(src, {}), '<div class="alpha beta gamma">Test it</div>');
    done();
  });

  test('class attribute merging with empty static', function(done) {
    var src = '.alpha class="beta" class="" class="gamma" Test it';

    assert.equal(template.eval(src, {}), '<div class="alpha beta gamma">Test it</div>');
    done();
  });

  test('id attribute merging', function(done) {
    var src = '#alpha id="beta" Test it';

    assert.equal(template.eval(src, {}), '<div id="alpha_beta">Test it</div>');
    done();
  });

  test('boolean attribute false', function(done) {
    var src = '- var cond = false\n' +
              'option selected=false Text\n' +
              'option selected=cond Text2';

    assert.equal(template.eval(src, {}), '<option>Text</option><option>Text2</option>');
    done();
  });

});
