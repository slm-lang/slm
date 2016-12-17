var Template = require('../../lib/template');
var assertHtml = require('../helper').assertHtml;

describe('Code output', function() {
  var template;
  beforeEach(function() {
    template = new Template(require('../../lib/vm_node'));
  });

  test('render with call', function() {
    assertHtml(template, [
      'p',
      '  = this.helloWorld'
      ],
      '<p>Hello World from @env</p>',
      {});
  });

  test('render with trailing whitespace', function() {
    assertHtml(template, [
      'p',
      '  => this.helloWorld'
      ],
      '<p>Hello World from @env </p>',
      {});
  });

  test('render with leading whitespace', function() {
    assertHtml(template, [
      'p',
      '  =< this.helloWorld'
      ],
      '<p> Hello World from @env</p>',
      {});
  });

  test('render with trailing whitespace after tag', function() {
    assertHtml(template, [
      'p=> this.helloWorld'
      ],
      '<p>Hello World from @env</p> ',
      {});
  });

  test('no escape render with trailing whitespace', function() {
    assertHtml(template, [
      'p',
      '  ==> this.helloWorld'
      ],
      '<p>Hello World from @env </p>',
      {});
  });

  test('no escape render with trailing whitespace after tag', function() {
    assertHtml(template, [
      'p==> this.helloWorld'
      ],
      '<p>Hello World from @env</p> ',
      {});
  });

  test('no escape render with trailing whitespace after tag', function() {
    assertHtml(template, [
      'p==> this.helloWorld'
      ],
      '<p>Hello World from @env</p> ',
      {});
  });

  test('render with backslash end', function() {
    assertHtml(template, [
      'p = \\',
      '"Hello" + \\',
      '" JS!"',
      '- var variable = 1 + \\',
      '      2 + \\',
      ' 3',
      '= variable + \\',
      '  1'
      ],
      '<p>Hello JS!</p>7',
      {});
  });

  test('render multi line code', function() {
    assertHtml(template, [
      '-  var niceX = function(x) {',
      '-     return x + \'nice\';',
      '-  }',
      'p = niceX("Very ")'
      ],
      '<p>Very nice</p>',
      {});
  });

  test('render with comma end', function() {
    assertHtml(template, [
      'p = this.message("Hello",',
      '                 "JS!")'
      ],
      '<p>Hello JS!</p>',
      {});
  });

});
