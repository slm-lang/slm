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

});
