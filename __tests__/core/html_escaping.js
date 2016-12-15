var Lab = require('lab');
var Template = require('../../lib/template');
var assert  = require('chai').assert;
var assertHtml = require('../helper').assertHtml;

var lab = exports.lab = Lab.script();

lab.experiment('Html escaping', function() {
  var template;
  lab.before(function(done) {
    template = new Template(require('../../lib/vm_node'));
    done();
  });

  lab.test('html will not be escaped', function(done) {
    assertHtml(template, [
      'p <Hello> World, meet "Slm".'
      ],
      '<p><Hello> World, meet "Slm".</p>',
      {}, done);
  });

  lab.test('html with newline will not be escaped', function(done) {
    assertHtml(template, [
      'p',
      '  |',
      '    <Hello> World,',
      '     meet "Slim".'
      ],
      '<p><Hello> World,\n meet "Slim".</p>',
      {}, done);
  });

  lab.test('html with escaped interpolation', function(done) {
    assertHtml(template, [
      '- var x = \'"\'',
      '- var content = \'<x>\'',
      'p class="${x}" test ${content}'
      ],
      '<p class="&quot;">test &lt;x&gt;</p>',
      {}, done);
  });

  lab.test('html with raw interpolation', function(done) {
    assertHtml(template, [
      '- var x = "text<br/>"',
      'p ${=x}',
      'p $y=1',
      'p y$=x',
      'p y$y=x'
      ],
      '<p>text<br/></p><p $y="1"></p><p y$="text&lt;br/&gt;"></p><p y$y="text&lt;br/&gt;"></p>',
      {}, done);
  });

  lab.test('html nested escaping', function(done) {
    assertHtml(template, [
      '= this.helloBlock(function())',
      '  | escaped &'
      ],
      'Hello World from @env escaped &amp; Hello World from @env',
      {}, done);
  });

  lab.test('html quoted attr escape', function(done) {
    assertHtml(template, [
      'p id="&" class=="&amp;"'
      ],
      '<p class="&amp;" id="&amp;"></p>',
      {}, done);
  });

  lab.test('html quoted attr escape with interpolation', function(done) {
    assertHtml(template, [
      'p id="&${\'"\'}" class=="&amp;${\'"\'}"',
      'p id="&${=\'"\'}" class=="&amp;${=\'"\'}"'
      ],
      '<p class="&amp;&quot;" id="&amp;&quot;"></p><p class="&amp;"" id="&amp;""></p>',
      {}, done);
  });

  lab.test('html js attr escape', function(done) {
    assertHtml(template, [
      'p id=(\'&\'.toString()) class==(\'&amp;\'.toString())'
      ],
      '<p class="&amp;" id="&amp;"></p>',
      {}, done);
  });

  lab.test('html json xss', function(done) {
    assertHtml(template, [
      'script:',
      '  var x = ${= j()};'
      ],
      '<script>var x = undefined;</script>',
      {});

    assertHtml(template, [
      'script:',
      '  var x = ${= j(this.address)};'
      ],
      '<script>var x = undefined;</script>',
      {address: '<script>alert("xss")</script>'}, done);
  });
});
