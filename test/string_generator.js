var Lab = require('lab'),
    Generator = require('../lib/string_generator').Generator;

var suite   = Lab.experiment;
var before  = Lab.before;
var after   = Lab.after;
var test    = Lab.test
var assert  = Lab.assert

suite("String generator", function() {

  test("#exec", function(done) {

    var sexps = [
      'multi',
      [
        ['static', 'hello'],
        ['newline'],
        ['code', 'console.log("nice")'],
        ['dynamic', '1 + 2'],
      ]
    ];

    var generator = new Generator;

    assert.equal(generator.exec(sexps), "var _buf='';_buf+=\"hello\";\nconsole.log(\"nice\");_buf+=1 + 2;return _buf;");

    done();
  });
});
