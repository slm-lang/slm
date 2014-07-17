var Lab = require('lab'),
    Brackets = require('../../lib/filters/brackets'),
    Parser = require('../../lib/parser');

var suite   = Lab.experiment;
var before  = Lab.before;
var after   = Lab.after;
var test    = Lab.test
var assert  = Lab.assert

suite("Brackets", function() {

  var filter;

  before(function(done) {
    parser = new Parser;
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

  test('wraps if statement with spaces', function(done) {
    assert.deepEqual(
      filter.exec(['multi', ['slm', 'control', 'if   this.x > 0  ',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline']]]
      ]),
      ['multi', ['slm', 'control', 'if   (this.x > 0)   {',
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

  test('wraps if and else statements', function(done) {
    assert.deepEqual(
      filter.exec(['multi',
                    ['slm', 'control', 'if this.x > 0',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline']]],
                    ['slm', 'control', 'else if this.x < 0',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text2']]]
                        ], ['newline']]]
      ]),
      ['multi', ['slm', 'control', 'if (this.x > 0) {',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline']]],
                ['slm', 'control', '} else if (this.x < 0) {',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text2']]]
                        ], ['newline']]],
                ['code', '}']
      ]
    );
    done();
  });

  test('wraps for loop', function(done) {
    assert.deepEqual(
      filter.exec(['multi', ['slm', 'control', 'for i = 0; i < items.length; i++',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline']]]
      ]),
      ['multi', ['slm', 'control', 'for (i = 0; i < items.length; i++) {',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline']]], ['code', '}']
      ]
    );
    done();
  });

  test('wraps while loop', function(done) {
    assert.deepEqual(
      filter.exec(['multi', ['slm', 'control', 'while i < 10',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline']]]
      ]),
      ['multi', ['slm', 'control', 'while (i < 10) {',
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
