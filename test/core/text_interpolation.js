var Lab = require('lab');
var Template = require('../../lib/template');
var assert  = require('chai').assert;
var assertHtml = require('../helper').assertHtml;

var lab = exports.lab = Lab.script();

lab.experiment('Text interpolation', function() {
  var template;
  lab.before(function(done) {
    template = new Template(require('../../lib/vm_node'));
    done();
  });

  lab.test('interpolation in attribute', function(done) {
    assertHtml(template, [
      'p id="a${this.idHelper}b" = this.helloWorld'
      ],
      '<p id="anoticeb">Hello World from @env</p>',
      {}, done);
  });

  lab.test('nested interpolation in attribute', function(done) {
    assertHtml(template, [
      'p id="${"abc${1+1}" + "("}" = this.helloWorld'
      ],
      '<p id="abc${1+1}(">Hello World from @env</p>',
      {}, done);
  });

  lab.test('expression in interpolation', function(done) {
    assertHtml(template, [
      'p ${this.helloWorld2 || "test"} other text',
      ],
      '<p>test other text</p>',
      {}, done);
  });

  lab.test('interpolation in text', function(done) {
    assertHtml(template, [
      'p',
      ' | ${this.helloWorld} with "quotes"',
      'p',
      ' |',
      '  A message from the compiler: ${this.helloWorld}'
      ],
      '<p>Hello World from @env with "quotes"</p><p>A message from the compiler: Hello World from @env</p>',
      {}, done);
  });

  lab.test('interpolation in tag', function(done) {
    assertHtml(template, [
      'p ${this.helloWorld}'
      ],
      '<p>Hello World from @env</p>',
      {}, done);
  });

  lab.test('escape interpolation', function(done) {
    assertHtml(template, [
      'p \\${this.helloWorld}',
      'p text1 \\${this.helloWorld} text2'
      ],
      '<p>${this.helloWorld}</p><p>text1 ${this.helloWorld} text2</p>',
      {}, done);
  });

  lab.test('interpolation with escaping', function(done) {
    assertHtml(template, [
      '| ${this.evilMethod()}'
      ],
      '&lt;script&gt;do_something_evil();&lt;/script&gt;',
      {}, done);
  });

  lab.test('interpolation with escaping', function(done) {
    assertHtml(template, [
      '| ${=this.evilMethod()}'
      ],
      '<script>do_something_evil();</script>',
      {}, done);
  });

  lab.test('interpolation with escaping and delimiter', function(done) {
    assertHtml(template, [
      '| ${(this.evilMethod())}'
      ],
      '&lt;script&gt;do_something_evil();&lt;/script&gt;',
      {}, done);
  });
});
