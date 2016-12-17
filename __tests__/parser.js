var Parser = require('../lib/parser');


describe('Parser', function() {

  test('._getIndent()', function() {
    var parser = new Parser();

    expect(parser._getIndent(' ')).toEqual(1);
    expect(parser._getIndent(' ')).toEqual(1);
    expect(parser._getIndent(' . text')).toEqual(1);

    expect(parser._getIndent('  bold')).toEqual(2);
    expect(parser._getIndent('\t  strong')).toEqual(3);

  });

  test('.exec()', function() {
    var parser = new Parser();

    expect(parser.exec(' ')).toEqual([ 'multi', [ 'newline' ] ]);

    expect(parser.exec('/ text')).toEqual(['multi', ['newline']]);

    expect(parser.exec('/ line 1\n   line 2')).toEqual(['multi', ['newline'], ['newline']]);

    expect(parser.exec('== 5')).toEqual(
      [
        'multi',
        ['slm', 'output', false, '5', ['multi', ['newline']]]
      ]
    );

    expect(parser.exec('p nice')).toEqual(
      [
        'multi',
        [
          'html', 'tag', 'p',
          ['html', 'attrs'],
          ['slm', 'text',
            ['multi', ['slm', 'interpolate', 'nice']]]], ['newline']
      ]
    );

    expect(parser.exec('. text')).toEqual([
        'multi',
        [
          'slm', 'text',
          ['multi', ['slm', 'interpolate', 'text']]
        ],
        ['static', ' '], ['newline']
      ]
    );

    expect(parser.exec('p.alert')).toEqual(
      [
        'multi',
        [
          'html', 'tag', 'p',
          [
            'html', 'attrs',
            ['html', 'attr', 'class', ['static', 'alert']]
          ],
          ['multi', ['newline']]
        ]
      ]
    );

    expect(
      parser.exec('a href="http://anjlab.ru" AnjLab')
    ).toEqual(
      [
        'multi',
        [
          'html', 'tag', 'a',
          [
            'html', 'attrs',
            [
              'html', 'attr', 'href',
              [
                'escape', true,
                ['slm', 'interpolate', 'http://anjlab.ru']
              ]
            ]
          ],
          [
            'slm', 'text',
            [
              'multi',
              ['slm', 'interpolate', 'AnjLab']
              ]
          ]
        ],
        ['newline']
      ]
    );

    expect(
      parser.exec('/[if IE]\n    p Get a better browser.')
    ).toEqual(
      [
        'multi',
        ['html', 'condcomment', 'if IE',
          [
            'multi',
            ['newline'],
            ['html', 'tag', 'p', ['html', 'attrs'], ['slm', 'text',
              ['multi', ['slm', 'interpolate', 'Get a better browser.']]
            ]],
            ['newline']
          ]
        ]
      ]
    );

    expect(parser.exec('p = 10')).toEqual(
      [
        'multi',
        [
          'html', 'tag', 'p',
          ['html', 'attrs'],
          ['slm', 'output', true, '10', ['multi', ['newline']]]
        ]
      ]
    );

    var code =
      '- if (x)\n' +
      '  p = x\n' +
      'p nice';

    expect(parser.exec(code)).toEqual(
      [
        'multi',
        [
          'slm', 'control', 'if (x)',
          [
            'multi',
            ['newline'],
            [
              'html', 'tag', 'p',
              ['html', 'attrs'],
              ['slm', 'output', true, 'x', ['multi', ['newline']]]
            ]
          ]
        ],
        ['html', 'tag', 'p', ['html', 'attrs'], ['slm', 'text', ['multi', ['slm', 'interpolate', 'nice']]]], ['newline']
      ]
    );
  });
});
