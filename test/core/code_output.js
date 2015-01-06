var Lab = require('lab');
var Template = require('../../lib/template');
var assert  = require('chai').assert;
var assertHtml = require('../helper').assertHtml;

var lab = exports.lab = Lab.script();

lab.experiment('Code output', function() {
  var template;
  lab.before(function(done) {
    template = new Template(require('../../lib/vm_node'));
    done();
  });

  lab.test('render with call', function(done) {
    assertHtml(template, [
      'p',
      '  = this.helloWorld'
      ],
      '<p>Hello World from @env</p>',
      {}, done);
  });

  lab.test('render with trailing whitespace', function(done) {
    assertHtml(template, [
      'p',
      '  => this.helloWorld'
      ],
      '<p>Hello World from @env </p>',
      {}, done);
  });

  lab.test('render with leading whitespace', function(done) {
    assertHtml(template, [
      'p',
      '  =< this.helloWorld'
      ],
      '<p> Hello World from @env</p>',
      {}, done);
  });

  lab.test('render with trailing whitespace after tag', function(done) {
    assertHtml(template, [
      'p=> this.helloWorld'
      ],
      '<p>Hello World from @env</p> ',
      {}, done);
  });

  lab.test('no escape render with trailing whitespace', function(done) {
    assertHtml(template, [
      'p',
      '  ==> this.helloWorld'
      ],
      '<p>Hello World from @env </p>',
      {}, done);
  });

  lab.test('no escape render with trailing whitespace after tag', function(done) {
    assertHtml(template, [
      'p==> this.helloWorld'
      ],
      '<p>Hello World from @env</p> ',
      {}, done);
  });

  lab.test('no escape render with trailing whitespace after tag', function(done) {
    assertHtml(template, [
      'p==> this.helloWorld'
      ],
      '<p>Hello World from @env</p> ',
      {}, done);
  });

  lab.test('render with backslash end', function(done) {
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
      {}, done);
  });

  lab.test('render multi line code', function(done) {
    assertHtml(template, [
      '-  var niceX = function(x) {',
      '-     return x + \'nice\';',
      '-  }',
      'p = niceX("Very ")'
      ],
      '<p>Very nice</p>',
      {}, done);
  });

  lab.test('render with comma end', function(done) {
    assertHtml(template, [
      'p = this.message("Hello",',
      '                 "JS!")'
      ],
      '<p>Hello JS!</p>',
      {}, done);
  });

});
