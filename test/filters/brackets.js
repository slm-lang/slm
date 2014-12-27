var Lab = require('lab');
var Brackets = require('../../lib/filters/brackets');
var assert  = require('chai').assert;

var lab = exports.lab = Lab.script();


lab.experiment('Brackets', function() {

  var filter;

  lab.before(function(done) {
    filter = new Brackets();
    done();
  });

  lab.test('wraps if statement', function(done) {
    assert.deepEqual(
      filter.exec(['multi', ['slm', 'control', 'if this.x > 0',
                      ['multi',
                        ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ],
                        ['newline']]]
      ]),
      ['multi', ['slm', 'control', 'if (this.x > 0){',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline'], ['code', '}']]]
      ]
    );
    done();
  });

  lab.test('wraps if statement with spaces', function(done) {
    assert.deepEqual(
      filter.exec(['multi', ['slm', 'control', 'if   this.x > 0  ',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline']]]
      ]),
      ['multi', ['slm', 'control', 'if   (this.x > 0)  {',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline'], ['code', '}']]]
      ]
    );
    done();
  });

  lab.test('not wraps wrapped if statement', function(done) {
    assert.deepEqual(
      filter.exec(['multi', ['slm', 'control', 'if (this.x > 0)',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline']]]
      ]),
      ['multi', ['slm', 'control', 'if (this.x > 0){',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline'], ['code', '}']]]
      ]
    );
    done();
  });

  lab.test('wraps if and else statements', function(done) {
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
      ['multi', ['slm', 'control', 'if (this.x > 0){',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline'], ['code', '}']]],
                ['slm', 'control', 'else if (this.x < 0){',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text2']]]
                        ], ['newline'], ['code', '}']]]
      ]
    );
    done();
  });

  lab.test('wraps for loop', function(done) {
    assert.deepEqual(
      filter.exec(['multi', ['slm', 'control', 'for i = 0; i < items.length; i++',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline']]]
      ]),
      ['multi', ['slm', 'control', 'for (i = 0; i < items.length; i++){',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline'], ['code', '}']]]
      ]
    );
    done();
  });

  lab.test('wraps while loop', function(done) {
    assert.deepEqual(
      filter.exec(['multi', ['slm', 'control', 'while i < 10',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline']]]
      ]),
      ['multi', ['slm', 'control', 'while (i < 10){',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline'], ['code', '}']]]
      ]
    );
    done();
  });
});
