var Template = require('../../lib/template');
var assertHtml = require('../helper').assertHtml;

describe('Html escaping', function() {
  var template;
  beforeEach(function() {
    template = new Template(require('../../lib/vm_node'));
  });

  test('html will not be escaped', function() {
    assertHtml(template, [
      'p <Hello> World, meet "Slm".'
      ],
      '<p><Hello> World, meet "Slm".</p>',
      {});
  });

  test('html with newline will not be escaped', function() {
    assertHtml(template, [
      'p',
      '  |',
      '    <Hello> World,',
      '     meet "Slim".'
      ],
      '<p><Hello> World,\n meet "Slim".</p>',
      {});
  });

  test('html with escaped interpolation', function() {
    assertHtml(template, [
      '- var x = \'"\'',
      '- var content = \'<x>\'',
      'p class="${x}" test ${content}'
      ],
      '<p class="&quot;">test &lt;x&gt;</p>',
      {});
  });

  test('html with raw interpolation', function() {
    assertHtml(template, [
      '- var x = "text<br/>"',
      'p ${=x}',
      'p $y=1',
      'p y$=x',
      'p y$y=x'
      ],
      '<p>text<br/></p><p $y="1"></p><p y$="text&lt;br/&gt;"></p><p y$y="text&lt;br/&gt;"></p>',
      {});
  });

  test('html nested escaping', function() {
    assertHtml(template, [
      '= this.helloBlock(function())',
      '  | escaped &'
      ],
      'Hello World from @env escaped &amp; Hello World from @env',
      {});
  });

  test('html quoted attr escape', function() {
    assertHtml(template, [
      'p id="&" class=="&amp;"'
      ],
      '<p class="&amp;" id="&amp;"></p>',
      {});
  });

  test('html quoted attr escape with interpolation', function() {
    assertHtml(template, [
      'p id="&${\'"\'}" class=="&amp;${\'"\'}"',
      'p id="&${=\'"\'}" class=="&amp;${=\'"\'}"'
      ],
      '<p class="&amp;&quot;" id="&amp;&quot;"></p><p class="&amp;"" id="&amp;""></p>',
      {});
  });

  test('html js attr escape', function() {
    assertHtml(template, [
      'p id=(\'&\'.toString()) class==(\'&amp;\'.toString())'
      ],
      '<p class="&amp;" id="&amp;"></p>',
      {});
  });

  test('html json xss', function() {
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
      {address: '<script>alert("xss")</script>'});
  });
});
