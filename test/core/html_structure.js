var Lab = require('lab'),
    Template = require('../../lib/template');

var suite   = Lab.experiment;
var before  = Lab.before;
var after   = Lab.after;
var test    = Lab.test
var assert  = Lab.assert

suite('Html structure', function() {
  var template;
  before(function(done) {
    template = new Template
    done();
  });

  test('simple render', function(done) {
    var src = [
      'html',
      '  head',
      '    title Simple Test Title',
      '  body ',
      '    p Hello World, meet Slim.'
    ].join('\n')

    assert.equal(template.eval(src, {}), '<html><head><title>Simple Test Title</title></head><body><p>Hello World, meet Slim.</p></body></html>');
    done();
  });

  test('html tag with text and empty line', function(done) {
    var src = [
      'p Hello',
      '',
      'p World'
    ].join('\n');

    assert.equal(template.eval(src, {}), '<p>Hello</p><p>World</p>');
    done();
  });

  test('html namespaces', function(done) {
    var src = [
      'html:body',
      '  html:p html:id="test" Text'
    ].join('\n');

    assert.equal(template.eval(src, {}), '<html:body><html:p html:id="test">Text</html:p></html:body>');
    done();
  });

  test('doctype', function(done) {
    var src = [
      'doctype 1.1',
      'html'
    ].join('\n');

    assert.equal(template.eval(src, {}), '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd"><html></html>');
    done();
  });

  test('doctype new syntax', function(done) {
    var src = [
      'doctype 5',
      'html'
    ].join('\n');

    assert.equal(template.eval(src, {}), '<!DOCTYPE html><html></html>');
    done();
  });

  test('doctype new syntax html 5', function(done) {
    var src = [
      'doctype html',
      'html'
    ].join('\n');

    assert.equal(template.eval(src, {}), '<!DOCTYPE html><html></html>');
    done();
  });

  test('render with shortcut attributes', function(done) {
    var src = [
      'h1#title This is my title',
      '#notice.hello.world',
      '  = this.helloWorld'
    ].join('\n')

    assert.equal(template.eval(src, {helloWorld: 'Hello World from @env'}), '<h1 id="title">This is my title</h1><div class="hello world" id="notice">Hello World from @env</div>');
    done();
  });

  test('render with text block', function(done) {
    var src = [
      'p',
      '  |',
      '   Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    ].join('\n')

    assert.equal(template.eval(src, {}), '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>');
    done();
  });

   test('render with text block with subsequent markup', function(done) {
    var src = [
      'p',
      '  |',
      '    Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      'p Some more markup'
    ].join('\n');

    assert.equal(template.eval(src, {}), '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p><p>Some more markup</p>');
    done();
  });

  test('render with text block with subsequent markup', function(done) {
    var src = [
      'p',
      '  |',
      '    Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      'p Some more markup'
    ].join('\n')

    assert.equal(template.eval(src, {}), '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p><p>Some more markup</p>');
    done();
  });

  test('render with text block with trailing whitespace', function(done) {
    var src = [
      '. this is',
      '  a link to',
      'a href="link" page',
    ].join('\n')

    assert.equal(template.eval(src, {}), "this is\na link to <a href=\"link\">page</a>");
    done();
  });

  test('render with text block with trailing whitespace', function(done) {
    var src = [
      'p',
      ' |',
      '  This is line one.',
      '   This is line two.',
      '    This is line three.',
      '     This is line four.',
      'p This is a new paragraph.'
    ].join('\n')

    assert.deepEqual(template.eval(src, {}), "<p>This is line one.\n This is line two.\n  This is line three.\n   This is line four.</p><p>This is a new paragraph.</p>");
    done();
  });

  test('nested text with nested html one same line', function(done) {
    var src = [
      'p',
      ' | This is line one.',
      '    This is line two.',
      ' span.bold This is a bold line in the paragraph.',
      ' |  This is more content.'
    ].join('\n');

    assert.deepEqual(template.eval(src, {}), "<p>This is line one.\n This is line two.<span class=\"bold\">This is a bold line in the paragraph.</span> This is more content.</p>");
    done();
  });

  test('nested text with nested html one same line 2', function(done) {
    var src = [
      'p',
      ' |This is line one.',
      '   This is line two.',
      ' span.bold This is a bold line in the paragraph.',
      ' |  This is more content.'
    ].join('\n');

    assert.deepEqual(template.eval(src, {}), "<p>This is line one.\n This is line two.<span class=\"bold\">This is a bold line in the paragraph.</span> This is more content.</p>");
    done();
  });

  test('nested text with nested html', function(done) {
    var src = [
      'p',
      ' |',
      '  This is line one.',
      '   This is line two.',
      '    This is line three.',
      '     This is line four.',
      ' span.bold This is a bold line in the paragraph.',
      ' |  This is more content.'
    ].join('\n')

    assert.deepEqual(template.eval(src, {}), "<p>This is line one.\n This is line two.\n  This is line three.\n   This is line four.<span class=\"bold\">This is a bold line in the paragraph.</span> This is more content.</p>");
    done();
  });

  test('simple paragraph with padding', function(done) {
    var src = 'p    There will be 3 spaces in front of this line.';

    assert.deepEqual(template.eval(src, {}), '<p>   There will be 3 spaces in front of this line.</p>');
    done();
  });

  test('paragraph with nested text', function(done) {
    var src = [
      'p This is line one.',
      '   This is line two.'
    ].join('\n')

    assert.deepEqual(template.eval(src, {}), "<p>This is line one.\n This is line two.</p>");
    done();
  });

  test('paragraph with padded nested text', function(done) {
    var src = [
      'p  This is line one.',
      '   This is line two.'
    ].join('\n');

    assert.deepEqual(template.eval(src, {}), "<p> This is line one.\n This is line two.</p>");
    done();
  });

  test('paragraph with attributes and nested text', function(done) {
    var src = [
      'p#test class="paragraph" This is line one.',
      '                         This is line two.'
    ].join('\n')

    assert.deepEqual(template.eval(src, {}), "<p class=\"paragraph\" id=\"test\">This is line one.\nThis is line two.</p>");
    done();
  });

  test('output_code_with_leading_spaces', function(done) {
    var src = [
      'p= this.helloWorld',
      'p = this.helloWorld',
      'p    = this.helloWorld'
    ].join('\n');

    assert.deepEqual(template.eval(src, {helloWorld: 'Hello World from @env'}), '<p>Hello World from @env</p><p>Hello World from @env</p><p>Hello World from @env</p>');
    done();
  });

  test('single quoted attributes', function(done) {
    var src = "p class='underscored_class_name' = this.outputNumber";

    assert.deepEqual(template.eval(src, {outputNumber: 1337}), '<p class="underscored_class_name">1337</p>');
    done();
  });

  test('nonstandard shortcut attributes', function(done) {
    var src = 'p#dashed-id.underscored_class_name = this.outputNumber';

    assert.deepEqual(template.eval(src, {outputNumber: 1337}), '<p class="underscored_class_name" id="dashed-id">1337</p>');
    done();
  });

  test('dashed attributes', function(done) {
    var src = 'p data-info="Illudium Q-36" = this.outputNumber';

    assert.deepEqual(template.eval(src, {outputNumber: 1337}), '<p data-info="Illudium Q-36">1337</p>');
    done();
  });

  test('dashed attributes with shortcuts', function(done) {
    var src = 'p#marvin.martian data-info="Illudium Q-36" = this.outputNumber';

    assert.deepEqual(template.eval(src, {outputNumber: 1337}), '<p class="martian" data-info="Illudium Q-36" id="marvin">1337</p>');
    done();
  });

  test('parens around attributes', function(done) {
    var src = 'p(id="marvin" class="martian" data-info="Illudium Q-36") = this.outputNumber';

    assert.deepEqual(template.eval(src, {outputNumber: 1337}), '<p class="martian" data-info="Illudium Q-36" id="marvin">1337</p>');
    done();
  });

  test('square brackets around attributes', function(done) {
    var src = 'p[id="marvin" class="martian" data-info="Illudium Q-36"] = this.outputNumber';

    assert.deepEqual(template.eval(src, {outputNumber: 1337}), '<p class="martian" data-info="Illudium Q-36" id="marvin">1337</p>');
    done();
  });

  test('parens around attributes with equal sign snug to right paren', function(done) {
    var src = 'p(id="marvin" class="martian" data-info="Illudium Q-36")= this.outputNumber';

    assert.deepEqual(template.eval(src, {outputNumber: 1337}), '<p class="martian" data-info="Illudium Q-36" id="marvin">1337</p>');
    done();
  });

  test('closed tag', function(done) {
    var src = 'closed/';

    assert.deepEqual(template.eval(src, {outputNumber: 1337}), '<closed />');
    done();
  });

  test('attributes with parens and spaces', function(done) {
    var src = "label{ for='filter' }= this.helloWorld";

    assert.deepEqual(template.eval(src, {helloWorld: 'Hello World from @env'}), '<label for="filter">Hello World from @env</label>');
    done();
  });

  test('attributes with parens and spaces 2', function(done) {
    var src = "label{ for='filter' } = this.helloWorld";

    assert.deepEqual(template.eval(src, {helloWorld: 'Hello World from @env'}), '<label for="filter">Hello World from @env</label>');
    done();
  });

  test('attributes with multiple spaces', function(done) {
    var src = "label  for='filter'  class=\"test\" = this.helloWorld";

    assert.deepEqual(template.eval(src, {helloWorld: 'Hello World from @env'}), '<label class="test" for="filter">Hello World from @env</label>');
    done();
  });

  test('closed tag with attributes', function(done) {
    var src = 'closed id="test" /';

    assert.deepEqual(template.eval(src, {}), '<closed id="test" />');
    done();
  });

  test('closed tag with attributes and parens', function(done) {
    var src = 'closed(id="test")/';

    assert.deepEqual(template.eval(src, {}), '<closed id="test" />');
    done();
  });

  test('render with html comments', function(done) {
    var src = [
      'p Hello',
      '/! This is a comment',
      '',
      '   Another comment',
      'p World'
    ].join('\n');

    assert.deepEqual(template.eval(src, {}), '<p>Hello</p><!--This is a comment\n\nAnother comment--><p>World</p>');
    done();
  });

  test('render with html conditional and tag', function(done) {
    var src = [
      '/[ if IE ]',
      ' p Get a better browser.'
    ].join('\n');

    assert.deepEqual(template.eval(src, {}), "<!--[if IE]><p>Get a better browser.</p><![endif]-->");
    done();
  });

  test('render with html conditional and method output', function(done) {
    var src = [
      "/[ if IE ]",
      " = this.message('hello')"
    ].join('\n');

    assert.deepEqual(template.eval(src, {message: function(v){return v}}), "<!--[if IE]>hello<![endif]-->");
    done();
  });

  test('multiline attributes with method', function(done) {
    var src = [
      'p(id="marvin"',
      'class="martian"',
      ' data-info="Illudium Q-36") = this.outputNumber'
    ].join('\n');

    assert.deepEqual(template.eval(src, {outputNumber: 1337}), '<p class="martian" data-info="Illudium Q-36" id="marvin">1337</p>');
    done();
  });

  test('multiline attributes with text on same line', function(done) {
    var src = [
      'p[id="marvin"',
      '  class="martian"',
      ' data-info="Illudium Q-36"] THE space modulator'
    ].join('\n')

    assert.deepEqual(template.eval(src, {}), '<p class="martian" data-info="Illudium Q-36" id="marvin">THE space modulator</p>');
    done();
  });

  test('multiline attributes with nested text', function(done) {
    var src = [
      'p(id="marvin"',
      '  class="martian"',
      'data-info="Illudium Q-36")',
      '  | THE space modulator'
    ].join('\n');

    assert.deepEqual(template.eval(src, {}), '<p class="martian" data-info="Illudium Q-36" id="marvin">THE space modulator</p>');
    done();
  });

  test('multiline attributes with dynamic attr', function(done) {
    var src = [
      'p{id=this.idHelper',
      '  class="martian"',
      '  data-info="Illudium Q-36"}',
      '  | THE space modulator'
    ].join('\n');
    assert.deepEqual(template.eval(src, {idHelper: 'notice'}), '<p class="martian" data-info="Illudium Q-36" id="notice">THE space modulator</p>');
    done();
  });

  test('multiline attributes with nested tag', function(done) {
    var src = [
      'p(id=this.idHelper',
      '  class="martian"',
      '  data-info="Illudium Q-36")',
      '  span.emphasis THE',
      '  |  space modulator'
    ].join('\n');

    assert.deepEqual(template.eval(src, {idHelper: 'notice'}), '<p class="martian" data-info="Illudium Q-36" id="notice"><span class="emphasis">THE</span> space modulator</p>');
    done();
  });

  test('multiline attributes with nested text and extra indentation', function(done) {
    var src = [
      'li( id="myid"',
      '    class="myclass"',
      'data-info="myinfo")',
      '  a href="link" My Link'
    ].join('\n')

    assert.deepEqual(template.eval(src, {}), '<li class="myclass" data-info="myinfo" id="myid"><a href="link">My Link</a></li>');
    done();
  });

  test('block expansion support', function(done) {
    var src = [
      "ul",
      "  li.first: a href='a' foo",
      "  li:       a href='b' bar",
      "  li.last:  a href='c' baz"
    ].join('\n');
    assert.deepEqual(template.eval(src, {}), '<ul><li class=\"first\"><a href=\"a\">foo</a></li><li><a href=\"b\">bar</a></li><li class=\"last\"><a href=\"c\">baz</a></li></ul>');
    done();
  });

  test('block expansion class attributes', function(done) {
    var src = '.a: .b: #c d'
    assert.deepEqual(template.eval(src, {}), '<div class="a"><div class="b"><div id="c">d</div></div></div>');
    done();
  });

  test('block expansion nesting', function(done) {
    var src = [
      'html: body: .content',
      '  | Text'
    ].join('\n');
    assert.deepEqual(template.eval(src, {}), '<html><body><div class=\"content\">Text</div></body></html>');
    done();
  });

  test('eval attributes once', function(done) {
    var src = [
      'input[value=++this.x]',
      'input[value=++this.x]'
    ].join('\n');
    assert.deepEqual(template.eval(src, {x: 0}), '<input value="1" /><input value="2" />');
    done();
  });

  test('html line indicator', function(done) {
    var src = [
      '<html>',
      '  head',
      '    meta name="keywords" content=this.helloWorld',
      '  - if true',
      '    <p>${this.helloWorld}</p>',
      '      span = this.helloWorld',
      '</html>'
    ].join('\n')

    assert.deepEqual(template.eval(src, {helloWorld: 'Hello World from @env'}), '<html><head><meta content="Hello World from @env" name="keywords" /></head><p>Hello World from @env</p><span>Hello World from @env</span></html>');
    done();
  });

});
