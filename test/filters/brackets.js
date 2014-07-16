var Lab = require('lab'),
    Brackets = require('../../lib/filters/brackets');

var suite   = Lab.experiment;
var before  = Lab.before;
var after   = Lab.after;
var test    = Lab.test
var assert  = Lab.assert

suite("Brackets", function() {

  var filter;

  before(function(done) {
    filter = new Brackets;
    done();
  });

  test('wraps if statement', function(done) {
    assert.deepEqual(
      filter.exec(['multi', ['slm', 'control', 'if this.x > 0',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline']]]
      ]),
      ['multi', ['slm', 'control', 'if (this.x > 0) {',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline']]], ['code', '}']
      ]
    );
    done();
  });

  test('not wraps wrapped if statement', function(done) {
    assert.deepEqual(
      filter.exec(['multi', ['slm', 'control', 'if (this.x > 0)',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline']]]
      ]),
      ['multi', ['slm', 'control', 'if (this.x > 0) {',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline']]], ['code', '}']
      ]
    );
    done();
  });
});
