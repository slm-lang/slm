var Template = require('../../lib/template');
var assertHtml = require('../helper').assertHtml;

describe('Html structure', function() {

  var template;

  beforeEach(function() {
    template = new Template(require('../../lib/vm_node'));
  });

  it('simple render', function() {
    assertHtml(template, [
      'html',
      '  head',
      '    title Simple Test Title',
      '  body ',
      '    p Hello World, meet Slim.'
    ],
    '<html><head><title>Simple Test Title</title></head><body><p>Hello World, meet Slim.</p></body></html>',
    {});
  });

  it('relaxed indentation of first line', function() {
    assertHtml(template, [
      '  p',
      '    .content'
    ],
    '<p><div class=\"content\"></div></p>',
    {});
  });

  it('html tag with text and empty line', function() {
    assertHtml(template, [
      'p Hello',
      '',
      'p World'
    ],
    '<p>Hello</p><p>World</p>',
    {});
  });

  it('html namespaces', function() {
    assertHtml(template, [
      'html:body',
      '  html:p html:id="test" Text'
    ],
    '<html:body><html:p html:id="test">Text</html:p></html:body>',
    {});
  });

  it('doctype', function() {
    assertHtml(template, [
      'doctype 1.1',
      'html'
    ],
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd"><html></html>',
    {});
  });

  it('render with shortcut attributes', function() {
    assertHtml(template, [
      'h1#title This is my title',
      '#notice.hello.world',
      '  = this.helloWorld'
    ],
    '<h1 id="title">This is my title</h1><div class="hello world" id="notice">Hello World from @env</div>',
    {});
  });

  it('render with text block', function() {
    assertHtml(template, [
      'p',
      '  |',
      '   Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    ],
    '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>',
    {});
  });

  it('render with text block with subsequent markup', function() {
    assertHtml(template, [
      'p',
      '  |',
      '    Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      'p Some more markup'
    ],
    '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p><p>Some more markup</p>',
    {});
  });

  it('render with text block with subsequent markup', function() {
    assertHtml(template, [
      'p',
      '  |',
      '    Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      'p Some more markup'
    ],
    '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p><p>Some more markup</p>',
    {});
  });

  it('render with text block with trailing whitespace', function() {
    assertHtml(template, [
      '. this is',
      '  a link to',
      'a href="link" page'
    ],
    'this is\na link to <a href="link">page</a>',
    {});
  });

  it('render with text block with trailing whitespace', function() {
    assertHtml(template, [
      'p',
      ' |',
      '  This is line one.',
      '   This is line two.',
      '    This is line three.',
      '     This is line four.',
      'p This is a new paragraph.'
    ],
    '<p>This is line one.\n This is line two.\n  This is line three.\n   This is line four.</p><p>This is a new paragraph.</p>',
    {});
  });

  it('nested text with nested html one same line', function() {
    assertHtml(template, [
      'p',
      ' | This is line one.',
      '    This is line two.',
      ' span.bold This is a bold line in the paragraph.',
      ' |  This is more content.'
    ],
    '<p>This is line one.\n This is line two.<span class="bold">This is a bold line in the paragraph.</span> This is more content.</p>',
    {});
  });

  it('nested text with nested html one same line 2', function() {
    assertHtml(template, [
      'p',
      ' |This is line one.',
      '   This is line two.',
      ' span.bold This is a bold line in the paragraph.',
      ' |  This is more content.'
    ],
    '<p>This is line one.\n This is line two.<span class="bold">This is a bold line in the paragraph.</span> This is more content.</p>',
    {});
  });

  it('nested text with nested html', function() {
    assertHtml(template, [
      'p',
      ' |',
      '  This is line one.',
      '   This is line two.',
      '    This is line three.',
      '     This is line four.',
      ' span.bold This is a bold line in the paragraph.',
      ' |  This is more content.'
    ],
    '<p>This is line one.\n This is line two.\n  This is line three.\n   This is line four.<span class="bold">This is a bold line in the paragraph.</span> This is more content.</p>',
    {});
  });

  it('simple paragraph with padding', function() {
    assertHtml(template, [
      'p    There will be 3 spaces in front of this line.'
    ],
    '<p>   There will be 3 spaces in front of this line.</p>',
    {});
  });

  it('paragraph with nested text', function() {
    assertHtml(template, [
      'p This is line one.',
      '   This is line two.'
    ],
    '<p>This is line one.\n This is line two.</p>',
    {});
  });

  it('paragraph with padded nested text', function() {
    assertHtml(template, [
      'p  This is line one.',
      '   This is line two.'
    ],
    '<p> This is line one.\n This is line two.</p>',
    {});
  });

  it('labels with with br', function() {
    assertHtml(template, [
      'label',
      '  . Название',
      '  input name="name" type="text" value=1',
      'br',
      '',
      'label',
      '  . Название 2',
      '  input name="name" type="text" value=2'
    ],
    '<label>Название <input name="name" type="text" value="1" /></label><br /><label>Название 2 <input name="name" type="text" value="2" /></label>',
    {});
  });

  it('with inline mustashe', function() {
    assertHtml(template, [
      'label {{title}}'
    ],
    '<label>{{title}}</label>',
    {});
  });

  it('paragraph with attributes and nested text', function() {
    assertHtml(template, [
      'p#test class="paragraph" This is line one.',
      '                         This is line two.'
    ],
    '<p class="paragraph" id="test">This is line one.\nThis is line two.</p>',
    {});
  });

  it('output code with leading spaces', function() {
    assertHtml(template, [
      'p= this.helloWorld',
      'p = this.helloWorld',
      'p    = this.helloWorld'
    ],
    '<p>Hello World from @env</p><p>Hello World from @env</p><p>Hello World from @env</p>',
    {});
  });

  it('output code with leading spaces 2', function() {
    assertHtml(template, [
      'p =< this.helloWorld'
    ],
    ' <p>Hello World from @env</p>',
    {});

    assertHtml(template, [
      'p<= this.helloWorld'
    ],
    ' <p>Hello World from @env</p>',
    {});
  });

  it('single quoted attributes', function() {
    assertHtml(template, [
      'p class=\'underscored_class_name\' = this.outputNumber'
    ],
    '<p class="underscored_class_name">1337</p>',
    {});
  });

  it('nonstandard shortcut attributes', function() {
    assertHtml(template, [
      'p#dashed-id.underscored_class_name = this.outputNumber'
    ],
    '<p class="underscored_class_name" id="dashed-id">1337</p>',
    {});
  });

  it('dashed attributes', function() {
    assertHtml(template, [
      'p data-info="Illudium Q-36" = this.outputNumber'
    ],
    '<p data-info="Illudium Q-36">1337</p>',
    {});
  });

  it('dashed attributes with shortcuts', function() {
    assertHtml(template, [
      'p#marvin.martian data-info="Illudium Q-36" = this.outputNumber'
    ],
    '<p class="martian" data-info="Illudium Q-36" id="marvin">1337</p>',
    {});
  });

  it('parens around attributes', function() {
    assertHtml(template, [
      'p(id="marvin" class="martian" data-info="Illudium Q-36") = this.outputNumber'
    ],
    '<p class="martian" data-info="Illudium Q-36" id="marvin">1337</p>',
    {});
  });

  it('square brackets around attributes', function() {
    assertHtml(template, [
      'p[id="marvin" class="martian" data-info="Illudium Q-36"] = this.outputNumber'
    ],
    '<p class="martian" data-info="Illudium Q-36" id="marvin">1337</p>',
    {});
  });

  it('parens around attributes with equal sign snug to right paren', function() {
    assertHtml(template, [
      'p(id="marvin" class="martian" data-info="Illudium Q-36")= this.outputNumber'
    ],
    '<p class="martian" data-info="Illudium Q-36" id="marvin">1337</p>',
    {});
  });

  it('closed tag', function() {
    assertHtml(template, [
      'closed/'
    ],
    '<closed />',
    {});
  });

  it('attributes with parens and spaces', function() {
    assertHtml(template, [
      'label[ for=\'filter\' ]= this.helloWorld'
    ],
    '<label for="filter">Hello World from @env</label>',
    {});
  });

  it('attributes with parens and spaces 2', function() {
    assertHtml(template, [
      'label[ for=\'filter\' ] = this.helloWorld'
    ],
    '<label for="filter">Hello World from @env</label>',
    {});
  });

  it('attributes with multiple spaces', function() {
    assertHtml(template, [
      'label  for=\'filter\'  class="test" = this.helloWorld'
    ],
    '<label class="test" for="filter">Hello World from @env</label>',
    {});
  });

  it('closed tag with attributes', function() {
    assertHtml(template, [
      'closed id="test" /'
    ],
    '<closed id="test" />',
    {});
  });

  it('closed tag with attributes and parens', function() {
    assertHtml(template, [
      'closed(id="test")/'
    ],
    '<closed id="test" />',
    {});
  });

  it('render with html comments', function() {
    assertHtml(template, [
      'p Hello',
      '/! This is a comment',
      '',
      '   Another comment',
      'p World'
    ],
    '<p>Hello</p><!--This is a comment\n\nAnother comment--><p>World</p>',
    {});
  });

  it('render with html conditional and tag', function() {
    assertHtml(template, [
      '/[ if IE ]',
      ' p Get a better browser.'
    ],
    '<!--[if IE]><p>Get a better browser.</p><![endif]-->',
    {});
  });

  it('render with html conditional and method output', function() {
    assertHtml(template, [
      '/[ if IE ]',
      ' = this.message(\'hello\')'
    ],
    '<!--[if IE]>hello<![endif]-->',
    {});
  });

  it('multiline attributes with method', function() {
    assertHtml(template, [
      'p(id="marvin"',
      'class="martian"',
      ' data-info="Illudium Q-36") = this.outputNumber'
    ],
    '<p class="martian" data-info="Illudium Q-36" id="marvin">1337</p>',
    {});
  });

  it('multiline attributes with text on same line', function() {
    assertHtml(template, [
      'p[id="marvin"',
      '  class="martian"',
      ' data-info="Illudium Q-36"] THE space modulator'
    ],
    '<p class="martian" data-info="Illudium Q-36" id="marvin">THE space modulator</p>',
    {});
  });

  it('multiline attributes with nested text', function() {
    assertHtml(template, [
      'p(id="marvin"',
      '  class="martian"',
      'data-info="Illudium Q-36")',
      '  | THE space modulator'
    ],
    '<p class="martian" data-info="Illudium Q-36" id="marvin">THE space modulator</p>',
    {});
  });

  it('multiline attributes with dynamic attr', function() {
    assertHtml(template, [
      'p[id=this.idHelper',
      '  class="martian"',
      '  data-info="Illudium Q-36"]',
      '  | THE space modulator'
    ],
    '<p class="martian" data-info="Illudium Q-36" id="notice">THE space modulator</p>',
    {});
  });

  it('multiline attributes with nested tag', function() {
    assertHtml(template, [
      'p(id=this.idHelper',
      '  class="martian"',
      '  data-info="Illudium Q-36")',
      '  span.emphasis THE',
      '  |  space modulator'
    ],
    '<p class="martian" data-info="Illudium Q-36" id="notice"><span class="emphasis">THE</span> space modulator</p>',
    {});
  });

  it('multiline attributes with nested text and extra indentation', function() {
    assertHtml(template, [
      'li( id="myid"',
      '    class="myclass"',
      'data-info="myinfo")',
      '  a href="link" My Link'
    ],
    '<li class="myclass" data-info="myinfo" id="myid"><a href="link">My Link</a></li>',
    {});
  });

  it('block expansion support', function() {
    assertHtml(template, [
      'ul',
      '  li.first: a href=\'a\' foo',
      '  li:       a href=\'b\' bar',
      '  li.last:  a href=\'c\' baz'
    ],
    '<ul><li class=\"first\"><a href=\"a\">foo</a></li><li><a href=\"b\">bar</a></li><li class=\"last\"><a href=\"c\">baz</a></li></ul>',
    {});
  });

  it('block expansion class attributes', function() {
    assertHtml(template, [
      '.a: .b: #c d'
    ],
    '<div class="a"><div class="b"><div id="c">d</div></div></div>',
    {});
  });

  it('block expansion nesting', function() {
    assertHtml(template, [
      'html: body: .content',
      '  | Text'
    ],
    '<html><body><div class=\"content\">Text</div></body></html>',
    {});
  });

  it('eval attributes once', function() {
    assertHtml(template, [
      'input[value=++this.x]',
      'input[value=++this.x]'
    ],
    '<input value="1" /><input value="2" />',
    {});
  });

  it('html line indicator', function() {
    assertHtml(template, [
      '<html>',
      '  head',
      '    meta name="keywords" content=this.helloWorld',
      '  - if true',
      '    <p>${this.helloWorld}</p>',
      '      span = this.helloWorld',
      '</html>'
    ],
    '<html><head><meta content="Hello World from @env" name="keywords" /></head><p>Hello World from @env</p><span>Hello World from @env</span></html>',
    {});
  });

  it('html line indicator issue #4', function() {
    assertHtml(template, [
      '<script>',
      '  | var a=b;',
      '</script>'
    ],
    '<script>var a=b;</script>',
    {});
  });

  it('leading whitespace indicator on tag', function() {
    assertHtml(template, [
      'p< text'
    ],
    ' <p>text</p>',
    {});
  });

  it('trailing whitespace indicator on tag', function() {
    assertHtml(template, [
      'p> text'
    ],
    '<p>text</p> ',
    {});
  });

  it('trailing whitespace with code', function() {
    assertHtml(template, [
      'p => "text"'
    ],
    '<p>text</p> ',
    {});
    assertHtml(template, [
      'p> = "text"'
    ],
    '<p>text</p> ',
    {});
  });

  it('test context', function() {
    var VM = template.VM;
    var vm = new VM();
    vm.resetCache();

    var compileOptions = {
      basePath: '/',
      filename: '/layout.slm'
    };

    vm.cache(compileOptions.filename, template.exec([
      'html',
      '  head',
      '    = content("head")',
      '  body',
      '    = content()'
    ].join('\n'), compileOptions, vm));

    compileOptions.filename = '/partialLayout.slm';
    vm.cache(compileOptions.filename, template.exec([
      'p Partial Layout',
      '= content()'
    ].join('\n'), compileOptions, vm));

    compileOptions.filename = '/partialWorld.slm';
    vm.cache(compileOptions.filename, template.exec([
      '- extend("partialLayout")',
      '- if this.what',
      '  strong The partial is ${this.what}',
      '= content("partial.override")',
      '= content()'
    ].join('\n'), compileOptions, vm));


    compileOptions.filename = '/script';

    var src = [
      '- extend("layout")',
      '= content("head")',
      '  meta name="keywords" content=this.who',
      'p Hello, ${this.who}',
      '= partial("partial" + this.who, {what: this.what})',
      '  = content("partial.override")',
      '    p nice',
      '  strong super!!! ${this.who}'
    ].join('\n');


    var result = template.render(src, {who: 'World', what: 'the best'}, compileOptions, vm);
    expect(result).toEqual('<html><head><meta content="World" name="keywords" /></head><body><p>Hello, World</p><p>Partial Layout</p><strong>The partial is the best</strong><p>nice</p><strong>super!!! World</strong></body></html>');
  });

  it('test current context in partials by default', function() {
    var VM = template.VM;
    var vm = new VM();
    vm.resetCache();

    var compileOptions = {
      basePath: '/',
      filename: '/a.slm'
    };

    vm.cache(compileOptions.filename, template.exec([
      'p Partial ${this.who}',
    ].join('\n'), compileOptions, vm));


    var src = [
      'p Current ${this.who}',
      '= partial("a")',
      '- this.who = "Another"',
      'p Current ${this.who}',
      '= partial("a")',
    ].join('\n');

    var result = template.render(src, {who: 'World', what: 'the best'}, compileOptions, vm);
    expect(result).toEqual('<p>Current World</p><p>Partial World</p><p>Current Another</p><p>Partial Another</p>');
  });
});
