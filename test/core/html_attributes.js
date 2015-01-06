var Lab = require('lab');
var Template = require('../../lib/template');
var assert  = require('chai').assert;
var assertHtml = require('../helper').assertHtml;

var lab = exports.lab = Lab.script();

lab.experiment('Html attribtues', function() {
  var template;
  lab.before(function(done) {
    template = new Template(require('../../lib/vm_node'));
    done();
  });

  lab.test('ternary operation in attribute', function(done) {
    assertHtml(template, [
      'p id="${(false ? \'notshown\' : \'shown\')}" = this.outputNumber'
      ],
      '<p id="shown">1337</p>',
      {}, done);
  });


  lab.test('ternary operation in attribute 2', function(done) {
    assertHtml(template, [
      'p id=(false ? \'notshown\' : \'shown\') = this.outputNumber'
      ],
      '<p id="shown">1337</p>',
      {}, done);
  });

  lab.test('class attribute merging', function(done) {
    assertHtml(template, [
      '.alpha class="beta" Test it'
      ],
      '<div class="alpha beta">Test it</div>',
      {}, done);
  });

  lab.test('class attribute merging with null', function(done) {
    assertHtml(template, [
      '.alpha class="beta" class=null class="gamma" Test it'
      ],
      '<div class="alpha beta gamma">Test it</div>',
      {}, done);
  });

  lab.test('class attribute merging with empty static', function(done) {
    assertHtml(template, [
      '.alpha class="beta" class="" class="gamma" Test it'
      ],
      '<div class="alpha beta gamma">Test it</div>',
      {}, done);
  });

  lab.test('id attribute merging', function(done) {
    var tmpl = new Template(require('../../lib/vm_node'), {mergeAttrs: {'id': '-'}});
    assertHtml(tmpl, [
      '#alpha id="beta" Test it'
      ],
      '<div id="alpha-beta">Test it</div>',
      {}, done);
  });

  lab.test('throws multiple id merge by default', function(done) {
    assert.throws(function() {
      assertHtml(template, [
        '#alpha id="beta" Test it'
        ],
        '<div id="alpha-beta">Test it</div>',
        {});
    }, 'Multiple id attributes specified');
    done();
  });

  lab.test('id attribute merging with array', function(done) {
    var tmpl = new Template(require('../../lib/vm_node'), {mergeAttrs: {'id': '_'}});
    assertHtml(tmpl, [
      '#alpha id=["beta", "gamma"] Test it'
      ],
      '<div id="alpha_beta_gamma">Test it</div>',
      {}, done);
  });

  lab.test('boolean attribute false', function(done) {
    assertHtml(template, [
      '- var cond = false',
      'option selected=false Text',
      'option selected=undefined Text2',
      'option selected=cond Text3'
      ],
      '<option>Text</option><option>Text2</option><option>Text3</option>',
      {}, done);
  });

  lab.test('boolean attribute true', function(done) {
    assertHtml(template, [
      '- var cond = true',
      'option selected=true Text',
      'option selected=1 Text2',
      'option selected=cond Text3'
      ],
      '<option selected="">Text</option><option selected="1">Text2</option><option selected="">Text3</option>',
      {}, done);
  });

  lab.test('boolean attribute null', function(done) {
    assertHtml(template, [
      '- var cond = null',
      'option selected=null Text',
      'option selected=cond Text2'
      ],
      '<option>Text</option><option>Text2</option>',
      {}, done);
  });

  lab.test('boolean attribute string2', function(done) {
    assertHtml(template, [
      'option selected="selected" Text'
      ],
      '<option selected="selected">Text</option>',
      {}, done);
  });

  lab.test('boolean attribute shortcut', function(done) {
    assertHtml(template, [
      'option(class="clazz" selected) Text',
      'option(selected class="clazz") Text'
      ],
      '<option class="clazz" selected="">Text</option><option class="clazz" selected="">Text</option>',
      {}, done);
  });

  lab.test('array attribute merging', function(done) {
    assertHtml(template, [
      '.alpha class="beta" class=[[""], "gamma", null, "delta", [true, false]]',
      '.alpha class=["beta","gamma"]'
      ],
      '<div class="alpha beta gamma delta true false"></div><div class="alpha beta gamma"></div>',
      {}, done);
  });

  lab.test('static empty attribute', function(done) {
    assertHtml(template, [
      'p(id="marvin" name="" class="" data-info="Illudium Q-36")= this.outputNumber'
      ],
      '<p data-info="Illudium Q-36" id="marvin" name="">1337</p>',
      {}, done);
  });

  lab.test('dynamic empty attribute', function(done) {
    assertHtml(template, [
      'p(id="marvin" class=null nonempty=("".toString()) data-info="Illudium Q-36")= this.outputNumber'
      ],
      '<p data-info="Illudium Q-36" id="marvin" nonempty="">1337</p>',
      {}, done);
  });

  lab.test('weird attribute', function(done) {
    assertHtml(template, [
      'p',
      '  img(src=\'img.png\' whatsthis?!)'
    ],
    '<p><img src="img.png" whatsthis?!="" /></p>',
    {}, done);
  });
});
