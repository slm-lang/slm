var Lab = require('lab'),
    Template = require('../../lib/template'),
    assertHtml = require('../helper').assertHtml;


var suite   = Lab.experiment;
var before  = Lab.before;
var after   = Lab.after;
var test    = Lab.test
var assert  = Lab.assert

suite('Embedded engines', function() {
  var template;
  before(function(done) {
    template = new Template();
    template.registerEmbeddedFunction('customEngine', function(body) {
      return "<pre>" + body + "</pre>";
    });
    done();
  });

  test('render with javascript', function(done) {
    assertHtml(template, [
      'javascript:   ',
      '  $(function() {});',
      '',
      '',
      '  alert(\'hello\')',
      'p Hi',
      ],
      '<script type="text/javascript">$(function() {});\n\n\nalert(\'hello\')</script><p>Hi</p>',
      {}, done);
  });

  test('render with script', function(done) {
    assertHtml(template, [
      'script:   ',
      '  $(function() {});',
      '',
      '',
      '  alert(\'hello\')',
      'p Hi',
      ],
      '<script>$(function() {});\n\n\nalert(\'hello\')</script><p>Hi</p>',
      {}, done);
  });

  test('render with javascript including variable', function(done) {
    assertHtml(template, [
      '- var func = "alert(\'hello\');"',
      'javascript:   ',
      '  $(function() { ${func} });',
      ],
      '<script type="text/javascript">$(function() { alert(\'hello\'); });</script>',
      {}, done);
  });

  test('render with css', function(done) {
    assertHtml(template, [
      'css:',
      '  body { color: red; }',
      ],
      '<style type="text/css">body { color: red; }</style>',
      {}, done);
  });

  test('render with custom engine', function(done) {
    assertHtml(template, [
      'customEngine:',
      '  text ${this.helloWorld}',
      '  text ${this.helloWorld}!',
      ],
      '<pre>text Hello World from @env\ntext Hello World from @env!</pre>',
      {}, done);
  });
});
