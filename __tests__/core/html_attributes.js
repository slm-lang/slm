var Template = require('../../lib/template');
var assertHtml = require('../helper').assertHtml;

describe('Html attribtues', function() {
  var template;
  var htmlTemplate;
  beforeEach(function() {
    template = new Template(require('../../lib/vm_node'));
    htmlTemplate = new Template(require('../../lib/vm_node'), {mergeAttrs: { 'class': ' ' }, attrDelims: { '(': ')' },  format: 'html' });
  });

  it('ternary operation in attribute', function() {
    assertHtml(template, [
      'p id="${(false ? \'notshown\' : \'shown\')}" = this.outputNumber'
      ],
      '<p id="shown">1337</p>',
      {});
  });


  it('ternary operation in attribute 2', function() {
    assertHtml(template, [
      'p id=(false ? \'notshown\' : \'shown\') = this.outputNumber'
      ],
      '<p id="shown">1337</p>',
      {});
  });

  it('class attribute merging', function() {
    assertHtml(template, [
      '.alpha class="beta" Test it'
      ],
      '<div class="alpha beta">Test it</div>',
      {});
  });

  it('class attribute merging with null', function() {
    assertHtml(template, [
      '.alpha class="beta" class=null class="gamma" Test it'
      ],
      '<div class="alpha beta gamma">Test it</div>',
      {});
  });

  it('class attribute merging with empty static', function() {
    assertHtml(template, [
      '.alpha class="beta" class="" class="gamma" Test it'
      ],
      '<div class="alpha beta gamma">Test it</div>',
      {});
  });

  it('id attribute merging', function() {
    var tmpl = new Template(require('../../lib/vm_node'), {mergeAttrs: {'id': '-'}});
    assertHtml(tmpl, [
      '#alpha id="beta" Test it'
      ],
      '<div id="alpha-beta">Test it</div>',
      {});
  });

  it('throws multiple id merge by default', function() {
    expect(function() {
      assertHtml(template, [
        '#alpha id="beta" Test it'
        ],
        '<div id="alpha-beta">Test it</div>',
        {});
    }).toThrowError('Multiple id attributes specified');
  });

  it('id attribute merging with array', function() {
    var tmpl = new Template(require('../../lib/vm_node'), {mergeAttrs: {'id': '_'}});
    assertHtml(tmpl, [
      '#alpha id=["beta", "gamma"] Test it'
      ],
      '<div id="alpha_beta_gamma">Test it</div>',
      {});
  });

  it('custom attribute delimiters', function() {
    assertHtml(htmlTemplate, [
      'div([value]="boundValue")',
      ],
      '<div [value]="boundValue"></div>',
      {});
  });

  it('xhtml boolean attribute false', function() {
    assertHtml(template, [
      '- var cond = false',
      'option selected=false Text',
      'option selected=undefined Text2',
      'option selected=cond Text3'
      ],
      '<option>Text</option><option>Text2</option><option>Text3</option>',
      {});
  });

  it('html boolean attribute false', function() {
    assertHtml(htmlTemplate, [
      '- var cond = false',
      'option selected=false Text',
      'option selected=undefined Text2',
      'option selected=cond Text3'
      ],
      '<option>Text</option><option>Text2</option><option>Text3</option>',
      {});
  });

  it('xhtml boolean attribute true', function() {
    assertHtml(template, [
      '- var cond = true',
      'option selected=true Text',
      'option selected=1 Text2',
      'option selected=cond Text3'
      ],
      '<option selected="">Text</option><option selected="1">Text2</option><option selected="">Text3</option>',
      {});
  });

  it('html boolean attribute true', function() {
    assertHtml(htmlTemplate, [
      '- var cond = true',
      'option selected=true Text',
      'option selected=1 Text2',
      'option selected=cond Text3'
      ],
      '<option selected>Text</option><option selected="1">Text2</option><option selected>Text3</option>',
      {});
  });

  it('xhtml boolean attribute null', function() {
    assertHtml(template, [
      '- var cond = null',
      'option selected=null Text',
      'option selected=cond Text2'
      ],
      '<option>Text</option><option>Text2</option>',
      {});
  });

  it('html boolean attribute null', function() {
    assertHtml(htmlTemplate, [
      '- var cond = null',
      'option selected=null Text',
      'option selected=cond Text2'
      ],
      '<option>Text</option><option>Text2</option>',
      {});
  });

  it('boolean attribute string2', function() {
    assertHtml(template, [
      'option selected="selected" Text'
      ],
      '<option selected="selected">Text</option>',
      {});
  });

  it('xhtml boolean attribute shortcut', function() {
    assertHtml(template, [
      'option(class="clazz" selected) Text',
      'option(selected class="clazz") Text'
      ],
      '<option class="clazz" selected="">Text</option><option class="clazz" selected="">Text</option>',
      {});
  });

  it('html boolean attribute shortcut', function() {
    assertHtml(htmlTemplate, [
      'option(class="clazz" selected) Text',
      'option(selected class="clazz") Text'
      ],
      '<option class="clazz" selected>Text</option><option class="clazz" selected>Text</option>',
      {});
  });

  it('array attribute merging', function() {
    assertHtml(template, [
      '.alpha class="beta" class=[[""], "gamma", null, "delta", [true, false]]',
      '.alpha class=["beta","gamma"]'
      ],
      '<div class="alpha beta gamma delta true false"></div><div class="alpha beta gamma"></div>',
      {});
  });

  it('static empty attribute', function() {
    assertHtml(template, [
      'p(id="marvin" name="" class="" data-info="Illudium Q-36")= this.outputNumber'
      ],
      '<p data-info="Illudium Q-36" id="marvin" name="">1337</p>',
      {});
  });

  it('dynamic empty attribute', function() {
    assertHtml(template, [
      'p(id="marvin" class=null nonempty=("".toString()) data-info="Illudium Q-36")= this.outputNumber'
      ],
      '<p data-info="Illudium Q-36" id="marvin" nonempty="">1337</p>',
      {});
  });

  it('weird attribute', function() {
    assertHtml(template, [
      'p',
      '  img(src=\'img.png\' whatsthis?!)'
    ],
    '<p><img src="img.png" whatsthis?!="" /></p>',
    {});
  });
});
