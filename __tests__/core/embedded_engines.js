var Lab = require('lab');
var Template = require('../../lib/template');
var assert  = require('chai').assert;
var assertHtml = require('../helper').assertHtml;

var lab = exports.lab = Lab.script();

lab.experiment('Embedded engines', function() {
  var template;
  lab.before(function(done) {
    template = new Template(require('../../lib/vm_node'));
    template.registerEmbeddedFunction('customEngine', function(body) {
      return '<pre>' + body + '</pre>';
    });
    done();
  });

  lab.test('render with javascript', function(done) {
    assertHtml(template, [
      'javascript:   ',
      '  $(function() {});',
      '',
      '',
      '  alert(\'hello\')',
      'p Hi'
      ],
      '<script type="text/javascript">$(function() {});\n\n\nalert(\'hello\')</script><p>Hi</p>',
      {}, done);
  });

  lab.test('render with script', function(done) {
    assertHtml(template, [
      'script:   ',
      '  $(function() {});',
      '',
      '',
      '  alert(\'hello\')',
      'p Hi'
      ],
      '<script>$(function() {});\n\n\nalert(\'hello\')</script><p>Hi</p>',
      {}, done);
  });

  lab.test('render with javascript including variable', function(done) {
    assertHtml(template, [
      '- var func = "alert(\'hello\');"',
      'javascript:   ',
      '  $(function() { ${func} });'
      ],
      '<script type="text/javascript">$(function() { alert(\'hello\'); });</script>',
      {}, done);
  });

  lab.test('render with css', function(done) {
    assertHtml(template, [
      'css:',
      '  body { color: red; }'
      ],
      '<style type="text/css">body { color: red; }</style>',
      {}, done);
  });

  lab.test('render with custom engine', function(done) {
    assertHtml(template, [
      'customEngine:',
      '  text ${this.helloWorld}',
      '  text ${this.helloWorld}!'
      ],
      '<pre>text Hello World from @env\ntext Hello World from @env!</pre>',
      {}, done);
  });

  lab.test('throws an error on unregistered engine', function(done) {
    assert.throws(function() {
      assertHtml(template, [
        'unregistered:',
        '  text'
        ],
        '', {});
    }, 'Embedded engine unregistered is not registered.');
    done();
  });
});
