var Lab = require('lab'),
    Template = require('../../lib/template'),
    assertHtml = require('../helper').assertHtml;

var suite   = Lab.experiment;
var before  = Lab.before;
var after   = Lab.after;
var test    = Lab.test
var assert  = Lab.assert

suite('Html escaping', function() {
  var template;
  before(function(done) {
    template = new Template
    done();
  });

  test('html will not be escaped', function(done) {
    assertHtml(template, [
      'p <Hello> World, meet "Slm".'
      ],
      '<p><Hello> World, meet "Slm".</p>',
      done);
  });

  test('html with newline will not be escaped', function(done) {
    assertHtml(template, [
      'p',
      '  |',
      '    <Hello> World,',
      '     meet "Slim".',
      ],
      '<p><Hello> World,\n meet "Slim".</p>',
      done);
  });

  test('html with escaped interpolation', function(done) {
    assertHtml(template, [
      "- var x = '\"'",
      "- var content = '<x>'",
      "p class=\"${x}\" test ${content}",
      ],
      '<p class="&quot;">test &lt;x&gt;</p>',
      done);
  });

  test('html nested escaping', function(done) {
    assertHtml(template, [
      '= this.helloBlock(function())',
      '  | escaped &',
      ],
      'Hello World from @env escaped &amp; Hello World from @env',
      done);
  });

  test('html quoted attr escape', function(done) {
    assertHtml(template, [
      'p id="&" class=="&amp;"',
      ],
      '<p class="&amp;" id="&amp;"></p>',
      done);
  });

  test('html quoted attr escape with interpolation', function(done) {
    assertHtml(template, [
      "p id=\"&${'\"'}\" class==\"&amp;${'\"'}\"",
      "p id=\"&${='\"'}\" class==\"&amp;${='\"'}\"",
      ],
      '<p class="&amp;&quot;" id="&amp;&quot;"></p><p class="&amp;"" id="&amp;""></p>',
      done);
  });

  test('html js attr escape', function(done) {
    assertHtml(template, [
      "p id=('&'.toString()) class==('&amp;'.toString())"
      ],
      '<p class="&amp;" id="&amp;"></p>',
      done);
  });
});
