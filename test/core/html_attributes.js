var Lab = require('lab'),
    Template = require('../../lib/template'),
    assertHtml = require('../helper').assertHtml;

var suite   = Lab.experiment;
var before  = Lab.before;
var after   = Lab.after;
var test    = Lab.test
var assert  = Lab.assert

suite('Html attribtues', function() {
  var template;
  before(function(done) {
    template = new Template
    done();
  });

  test('ternary operation in attribute', function(done) {
    assertHtml(template, [
      "p id=\"${(false ? 'notshown' : 'shown')}\" = this.outputNumber"
      ],
      '<p id="shown">1337</p>',
      {}, done);
  });


  test('ternary operation in attribute 2', function(done) {
    assertHtml(template, [
      "p id=(false ? 'notshown' : 'shown') = this.outputNumber"
      ],
      '<p id="shown">1337</p>',
      {}, done);
  });

  test('class attribute merging', function(done) {
    assertHtml(template, [
      '.alpha class="beta" Test it'
      ],
      '<div class="alpha beta">Test it</div>',
      {}, done);
  });

  test('class attribute merging with null', function(done) {
    assertHtml(template, [
      '.alpha class="beta" class=null class="gamma" Test it'
      ],
      '<div class="alpha beta gamma">Test it</div>',
      {}, done);
  });

  test('class attribute merging with empty static', function(done) {
    assertHtml(template, [
      '.alpha class="beta" class="" class="gamma" Test it'
      ],
      '<div class="alpha beta gamma">Test it</div>',
      {}, done);
  });

  test('id attribute merging', function(done) {
    assertHtml(template, [
      '#alpha id="beta" Test it'
      ],
      '<div id="alpha-beta">Test it</div>',
      {}, done);
  });

  test('boolean attribute false', function(done) {
    assertHtml(template, [
      '- var cond = false',
      'option selected=false Text',
      'option selected=undefined Text2',
      'option selected=cond Text3'
      ],
      '<option>Text</option><option>Text2</option><option>Text3</option>',
      {}, done);
  });

  test('boolean attribute true', function(done) {
    assertHtml(template, [
      '- var cond = true',
      'option selected=true Text',
      'option selected=1 Text2',
      'option selected=cond Text3',
      ],
      '<option selected="">Text</option><option selected="1">Text2</option><option selected="">Text3</option>',
      {}, done);
  });

  test('boolean attribute null', function(done) {
    assertHtml(template, [
      '- var cond = null',
      'option selected=null Text',
      'option selected=cond Text2'
      ],
      '<option>Text</option><option>Text2</option>',
      {}, done);
  });

  test('boolean attribute string2', function(done) {
    assertHtml(template, [
      'option selected="selected" Text'
      ],
      '<option selected="selected">Text</option>',
      {}, done);
  });

  test('boolean attribute shortcut', function(done) {
    assertHtml(template, [
      'option(class="clazz" selected) Text',
      'option(selected class="clazz") Text'
      ],
      '<option class="clazz" selected="">Text</option><option class="clazz" selected="">Text</option>',
      {}, done);
  });

  test('array attribute merging', function(done) {
    assertHtml(template, [
      '.alpha class="beta" class=[[""], "gamma", null, "delta", [true, false]]',
      '.alpha class=["beta","gamma"]'
      ],
      '<div class="alpha beta gamma delta true false"></div><div class="alpha beta gamma"></div>',
      {}, done);
  });

  test('static empty attribute', function(done) {
    assertHtml(template, [
      'p(id="marvin" name="" class="" data-info="Illudium Q-36")= this.outputNumber'
      ],
      '<p data-info="Illudium Q-36" id="marvin" name="">1337</p>',
      {}, done);
  });

  test('dynamic empty attribute', function(done) {
    assertHtml(template, [
      'p(id="marvin" class=null nonempty=("".toString()) data-info="Illudium Q-36")= this.outputNumber'
      ],
      '<p data-info="Illudium Q-36" id="marvin" nonempty="">1337</p>',
      {}, done);
  });
});
