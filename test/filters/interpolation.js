var Lab = require('lab');
var Template = require('../../lib/template');
var assert  = require('chai').assert;

var lab = exports.lab = Lab.script();


lab.experiment('Interpolate', function() {

  var template;
  lab.before(function(done) {
    template = new Template();
    done();
  });

  lab.test('interpolation in attribute', function(done) {
    var src = 'p id="a${this.id_helper}b" = this.hello_world';

    assert.deepEqual(
      template.eval(src, {id_helper: 'someid', hello_world: 'hello world'}),
      '<p id="asomeidb">hello world</p>'
    );
    done();
  });

  // Not yet
  lab.test('nested interpolation in attribute', function(done) {
    var src = 'p id="${"abc${1+1}" + "("}" = this.hello_world';

    assert.deepEqual(
      template.eval(src, {hello_world: 'Hello World from @env'}),
      '<p id="abc${1+1}(">Hello World from @env</p>'
    );

    done();
  });

  lab.test('interpolation in text', function(done) {
    var src =
      'p\n' +
      '  . ${this.hello_world} with "quotes"\n' +
      'p\n' +
      '  .\n' +
      '    A message from the compiler: ${this.hello_world}\n';

    assert.deepEqual(
      template.eval(src, {hello_world: 'Hello World from @env'}),
      '<p>Hello World from @env with \"quotes\" </p><p>A message from the compiler: Hello World from @env </p>');
    done();
  });

  lab.test('interpolation in tag', function(done) {
    var src = 'p ${this.hello_world}';
    assert.deepEqual(
      template.eval(src, {hello_world: 'Hello'}),
      '<p>Hello</p>');
    done();
  });

  lab.test('escape interpolation', function(done) {
    var src =
      'p \\${this.hello_world}\n' +
      'p text1 \\${this.hello_world} text2';
    assert.deepEqual(
      template.eval(src, {hello_world: 'Hello'}),
      '<p>${this.hello_world}</p><p>text1 ${this.hello_world} text2</p>');
    done();
  });

  lab.test('interpolation with escaping', function(done) {
    var src = '. ${this.evilMethod()}';
    assert.deepEqual(
      template.eval(src, {evilMethod: function() {return '<script>do_something_evil();</script>';}}),
      '&lt;script&gt;do_something_evil();&lt;/script&gt; ');
    done();
  });

  lab.test('interpolation without escaping', function(done) {
    var src = '| ${= this.evilMethod()}';
    assert.deepEqual(
      template.eval(src, {evilMethod: function() {return '<script>do_something_evil();</script>';}}),
      '<script>do_something_evil();</script>');
    done();
  });

  lab.test('interpolation with escaping and delimiter', function(done) {
    var src = '| ${(this.evilMethod())}';
    assert.deepEqual(
      template.eval(src, {evilMethod: function() {return '<script>do_something_evil();</script>';}}),
      '&lt;script&gt;do_something_evil();&lt;/script&gt;');

    done();
  });
});
