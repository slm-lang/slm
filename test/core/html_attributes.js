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
              'option selected=undefined Text2\n' +
              'option selected=cond Text3';

    assert.equal(template.eval(src, {}), '<option>Text</option><option>Text2</option><option>Text3</option>');
    done();
  });

  test('boolean attribute true', function(done) {
    var src = '- var cond = true\n' +
          'option selected=true Text\n' +
          'option selected=1 Text2\n' +
          'option selected=cond Text3';

    assert.equal(template.eval(src, {}), '<option selected="">Text</option><option selected="1">Text2</option><option selected="">Text3</option>');
    done();
  });

  test('boolean attribute null', function(done) {
    var src = '- var cond = null\n' +
          'option selected=null Text\n' +
          'option selected=cond Text2';

    assert.equal(template.eval(src, {}), '<option>Text</option><option>Text2</option>');
    done();
  });

  test('boolean attribute string2', function(done) {
    var src = 'option selected="selected" Text';

    assert.equal(template.eval(src, {}), '<option selected="selected">Text</option>');
    done();
  });

  test('boolean attribute shortcut', function(done) {
    var src = 'option(class="clazz" selected) Text\n' +
              'option(selected class="clazz") Text\n';

    assert.equal(template.eval(src, {}), '<option class="clazz" selected="">Text</option><option class="clazz" selected="">Text</option>');
    done();
  });


  test('array attribute merging', function(done) {
    var src = '.alpha class="beta" class=[[""], "gamma", null, "delta", [true, false]]\n' +
              '.alpha class=["beta","gamma"]\n';

    assert.equal(template.eval(src, {}), '<div class="alpha beta gamma delta true false"></div><div class="alpha beta gamma"></div>');
    done();
  });

  test('static empty attribute', function(done) {
    var src = 'p(id="marvin" name="" class="" data-info="Illudium Q-36")= this.outputNumber';

    assert.equal(template.eval(src, {outputNumber: 1337}), '<p data-info="Illudium Q-36" id="marvin" name="">1337</p>')
    done();
  });

  test('dynamic empty attribute', function(done) {
    var src = 'p(id="marvin" class=null nonempty=("".to_s) data-info="Illudium Q-36")= this.outputNumber';

    assert.equal(template.eval(src, {outputNumber: 1337}), '<p data-info="Illudium Q-36" id="marvin" nonempty="">1337</p>')
    done();
  });
});
