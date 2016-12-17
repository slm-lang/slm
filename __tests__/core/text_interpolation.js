var Template = require('../../lib/template');
var assertHtml = require('../helper').assertHtml;

describe('Text interpolation', function() {
  var template;
  beforeEach(function() {
    template = new Template(require('../../lib/vm_node'));
  });

  test('interpolation in attribute', function() {
    assertHtml(template, [
      'p id="a${this.idHelper}b" = this.helloWorld'
      ],
      '<p id="anoticeb">Hello World from @env</p>',
      {});
  });

  test('nested interpolation in attribute', function() {
    assertHtml(template, [
      'p id="${"abc${1+1}" + "("}" = this.helloWorld'
      ],
      '<p id="abc${1+1}(">Hello World from @env</p>',
      {});
  });

  test('expression in interpolation', function() {
    assertHtml(template, [
      'p ${this.helloWorld2 || "test"} other text',
      ],
      '<p>test other text</p>',
      {});
  });

  test('interpolation in text', function() {
    assertHtml(template, [
      'p',
      ' | ${this.helloWorld} with "quotes"',
      'p',
      ' |',
      '  A message from the compiler: ${this.helloWorld}'
      ],
      '<p>Hello World from @env with "quotes"</p><p>A message from the compiler: Hello World from @env</p>',
      {});
  });

  test('interpolation in tag', function() {
    assertHtml(template, [
      'p ${this.helloWorld}'
      ],
      '<p>Hello World from @env</p>',
      {});
  });

  test('escape interpolation', function() {
    assertHtml(template, [
      'p \\${this.helloWorld}',
      'p text1 \\${this.helloWorld} text2'
      ],
      '<p>${this.helloWorld}</p><p>text1 ${this.helloWorld} text2</p>',
      {});
  });

  test('interpolation with escaping', function() {
    assertHtml(template, [
      '| ${this.evilMethod()}'
      ],
      '&lt;script&gt;do_something_evil();&lt;/script&gt;',
      {});
  });

  test('interpolation with escaping', function() {
    assertHtml(template, [
      '| ${=this.evilMethod()}'
      ],
      '<script>do_something_evil();</script>',
      {});
  });

  test('interpolation with escaping and delimiter', function() {
    assertHtml(template, [
      '| ${(this.evilMethod())}'
      ],
      '&lt;script&gt;do_something_evil();&lt;/script&gt;',
      {});
  });
});
