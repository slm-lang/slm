var Filter = require('../../lib/html/fast');

describe('Fast', function() {

  var filter;

  beforeEach(function() {
    filter = new Filter();
  });

  it('compile html doctype', function() {
    expect(filter.exec(['multi', ['html', 'doctype', 'html']]))
    .toEqual(['multi', ['static', '<!DOCTYPE html>']]);

    expect(filter.exec(['multi', ['html', 'doctype', '5']]))
    .toEqual(['multi', ['static', '<!DOCTYPE html>']]);

    expect(filter.exec(['multi', ['html', 'doctype', '1.1']]))
    .toEqual(
      ['multi',
        ['static', '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">']
      ]
    );
  });

  it('compile xml encoding', function() {
    expect(filter.exec(['html', 'doctype', 'xml latin1']))
    .toEqual(['static', '<?xml version="1.0" encoding="latin1" ?>']);
  });

  it('compile html comment', function() {
    expect(filter.exec(['html', 'comment', ['static', 'test']]))
    .toEqual(['multi', ['static', '<!--'], ['static', 'test'], ['static', '-->']]);
  });

  it('compile js wrapped in comments', function() {
    expect(filter.exec(['html', 'js', ['static', 'test']]))
      .toEqual(
      ['multi', ['static', '\n//<![CDATA[\n'], ['static', 'test'], ['static', '\n//]]>\n']]
    );
  });

  it('compile autoclosed html tag', function() {
    expect(
      filter.exec(['html', 'tag',
        'img', ['attrs'],
        ['multi', ['newline']]
      ])).toEqual(
      ['multi',
        ['static', '<img'],
        ['attrs'],
        ['static', ' />'],
        ['multi', ['newline']]]
    );
  });

  it('compile explicitly closed html tag', function() {
    expect(
      filter.exec(['html', 'tag', 'closed', ['attrs']])
    ).toEqual(
      ['multi',
        ['static', '<closed'],
        ['attrs'],
        ['static', ' />']
      ]
    );
  });

  it('compile html with content', function() {
    expect(
      filter.exec(['html', 'tag',
      'div', ['attrs'], ['content']]),
    ).toEqual(
      ['multi',
        ['static', '<div'],
        ['attrs'],
        ['static', '>'],
        ['content'],
        ['static', '</div>']
      ]
    );
  });

  it('compile html with attrs', function() {
    expect(
      filter.exec(['html', 'tag', 'div',
        ['html', 'attrs',
          ['html', 'attr', 'id', ['static', 'test']],
          ['html', 'attr', 'class', ['dynamic', 'block']]],
        ['content']
      ])
    ).toEqual(
      ['multi',
        ['static', '<div'],
        ['multi',
          ['multi', ['static', ' id="'], ['static', 'test'], ['static', '"']],
          ['multi', ['static', ' class="'], ['dynamic', 'block'], ['static', '"']]],
        ['static', '>'],
        ['content'],
        ['static', '</div>']
      ]);
  });

  it('keep codes intact', function() {
    expect(filter.exec(['multi', ['code', 'foo']])).toEqual(['multi', ['code', 'foo']]);
  });

  it('should keep statics intact', function() {
    expect(filter.exec(['multi', ['static', '<']])).toEqual(['multi', ['static', '<']]);
  });

  it('should keep dynamic intact', function() {
    expect(filter.exec(['multi', ['dynamic', 'foo']])).toEqual(['multi', ['dynamic', 'foo']]);
  });

});
