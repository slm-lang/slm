var Lab = require('lab'),
    Template = require('../../lib/template'),
    assertHtml = require('../helper').assertHtml;

var suite   = Lab.experiment;
var before  = Lab.before;
var after   = Lab.after;
var test    = Lab.test
var assert  = Lab.assert

suite('Text interpolation', function() {
  var template;
  before(function(done) {
    template = new Template
    done();
  });

  test('interpolation in attribute', function(done) {
    assertHtml(template, [
      'p id="a${this.idHelper}b" = this.helloWorld'
      ],
      '<p id="anoticeb">Hello World from @env</p>',
      {}, done);
  });

  test('interpolation in text', function(done) {
    assertHtml(template, [
      'p',
      ' | ${this.helloWorld} with "quotes"',
      'p',
      ' |',
      '  A message from the compiler: ${this.helloWorld}',
      ],
      '<p>Hello World from @env with "quotes"</p><p>A message from the compiler: Hello World from @env</p>',
      {}, done);
  });

  test('interpolation in tag', function(done) {
    assertHtml(template, [
      'p ${this.helloWorld}',
      ],
      '<p>Hello World from @env</p>',
      {}, done);
  });

  test('escape interpolation', function(done) {
    assertHtml(template, [
      'p \\${this.helloWorld}',
      'p text1 \\${this.helloWorld} text2',
      ],
      '<p>${this.helloWorld}</p><p>text1 ${this.helloWorld} text2</p>',
      {}, done);
  });

  test('interpolation with escaping', function(done) {
    assertHtml(template, [
      '| ${this.evilMethod()}'
      ],
      '&lt;script&gt;do_something_evil();&lt;/script&gt;',
      {}, done);
  });

  test('interpolation with escaping', function(done) {
    assertHtml(template, [
      '| ${=this.evilMethod()}'
      ],
      '<script>do_something_evil();</script>',
      {}, done);
  });

  test('interpolation with escaping and delimiter', function(done) {
    assertHtml(template, [
      '| ${(this.evilMethod())}'
      ],
      '&lt;script&gt;do_something_evil();&lt;/script&gt;',
      {}, done);
  });
});
