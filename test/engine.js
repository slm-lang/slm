var Lab = require('lab'),
    Engine = require('../lib/engine'),
    Parser = require('../lib/parser'),
    FastHtml = require('../lib/html/fast'),
    Escape = require('../lib/filters/escape'),
    MultiFlattener = require('../lib/filters/multi_flattener'),
    StaticMerger = require('../lib/filters/static_merger'),
    StringGenerator = require('../lib/generators/string_generator');

var suite   = Lab.experiment;
var before  = Lab.before;
var after   = Lab.after;
var test    = Lab.test
var assert  = Lab.assert

suite("Engine", function() {
  var engine;
  before(function(done) {
    engine = new Engine;

    engine.use(new Parser);
    engine.use(new FastHtml);
    engine.use(new Escape);
    engine.use(new MultiFlattener);
    engine.use(new StaticMerger);
    engine.use(new StringGenerator);

    done();
  });

  test('it works!!', function(done) {
    for (var i = 0; i < 100000; i++) {
      engine.exec(
        'doctype html\n' +
        'html\n' +
        '  head\n' +
        '  body\n'
      );
    }
    done();
  });
});
