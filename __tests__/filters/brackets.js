var Brackets = require('../../lib/filters/brackets');

describe('Brackets', function() {

  var filter;

  beforeEach(function() {
    filter = new Brackets();
  });

  it('wraps if statement', function() {
    expect(
      filter.exec(['multi', ['slm', 'control', 'if this.x > 0',
                      ['multi',
                        ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ],
                        ['newline']]]
      ])).toEqual(
      ['multi', ['slm', 'control', 'if (this.x > 0){',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline'], ['code', '}']]]
      ]
    );
  });

  it('wraps if statement with spaces', function() {
    expect(
      filter.exec(['multi', ['slm', 'control', 'if   this.x > 0  ',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline']]]
      ])).toEqual(
      ['multi', ['slm', 'control', 'if   (this.x > 0)  {',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline'], ['code', '}']]]
      ]
    );
  });

  it('not wraps wrapped if statement', function() {
    expect(
      filter.exec(['multi', ['slm', 'control', 'if (this.x > 0)',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline']]]
      ])).toEqual(
      ['multi', ['slm', 'control', 'if (this.x > 0){',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline'], ['code', '}']]]
      ]
    );
  });

  it('wraps if and else statements', function() {
    expect(
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
      ])).toEqual(
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
  });

  it('wraps for loop', function() {
    expect(
      filter.exec(['multi', ['slm', 'control', 'for i = 0; i < items.length; i++',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline']]]
      ])).toEqual(
      ['multi', ['slm', 'control', 'for (i = 0; i < items.length; i++){',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline'], ['code', '}']]]
      ]
    );
  });

  it('wraps while loop', function() {
    expect(
      filter.exec(['multi', ['slm', 'control', 'while i < 10',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline']]]
      ])).toEqual(
      ['multi', ['slm', 'control', 'while (i < 10){',
                      ['multi', ['newline'],
                        ['html', 'tag', 'p',
                          ['html', 'attrs'],
                          ['slm', 'text', ['multi', ['slm', 'interpolate', 'Text']]]
                        ], ['newline'], ['code', '}']]]
      ]
    );
  });
});
