var Lab = require('lab');
var Parser = require('../lib/parser');
var assert  = require('chai').assert;

var lab = exports.lab = Lab.script();


lab.experiment('Parser', function() {

  lab.test('._getIndent()', function(done) {
    var parser = new Parser();

    assert.equal(parser._getIndent(' '), 1);
    assert.equal(parser._getIndent(' '), 1);
    assert.equal(parser._getIndent(' . text'), 1);

    assert.equal(parser._getIndent('  bold'), 2);
    assert.equal(parser._getIndent('\t  strong'), 3);

    done();
  });

  lab.test('.exec()', function(done) {
    var parser = new Parser();

    assert.deepEqual(
      parser.exec(' '),
      [ 'multi', [ 'newline' ] ]
    );

    assert.deepEqual(
      parser.exec('/ text'),
      ['multi', ['newline']]
    );

    assert.deepEqual(
      parser.exec('/ line 1\n   line 2'),
      ['multi', ['newline'], ['newline']]
    );

    assert.deepEqual(
      parser.exec('== 5'),
      [
        'multi',
        ['slm', 'output', false, '5', ['multi', ['newline']]]
      ]
    );

    assert.deepEqual(
      parser.exec('p nice'),
      [
        'multi',
        [
          'html', 'tag', 'p',
          ['html', 'attrs'],
          ['slm', 'text',
            ['multi', ['slm', 'interpolate', 'nice']]]], ['newline']
      ]
    );

    assert.deepEqual(
      parser.exec('. text'),
      [
        'multi',
        [
          'slm', 'text',
          ['multi', ['slm', 'interpolate', 'text']]
        ],
        ['static', ' '], ['newline']
      ]
    );

    assert.deepEqual(
      parser.exec('p.alert'),
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

    assert.deepEqual(
      parser.exec('a href="http://anjlab.ru" AnjLab'),
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

    assert.deepEqual(
      parser.exec('/[if IE]\n    p Get a better browser.'),
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

    assert.deepEqual(
      parser.exec('p = 10'),
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

    assert.deepEqual(
      parser.exec(code),
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

    done();
  });
});
