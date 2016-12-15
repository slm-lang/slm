var Lab = require('lab');
var Filter = require('../../lib/html/fast');
var assert  = require('chai').assert;

var lab = exports.lab = Lab.script();

lab.experiment('Fast', function() {

  var filter;

  lab.before(function(done) {
    filter = new Filter();
    done();
  });

  lab.test('compile html doctype', function(done) {
    assert.deepEqual(
      filter.exec(['multi', ['html', 'doctype', 'html']]),
      ['multi', ['static', '<!DOCTYPE html>']]
    );

    assert.deepEqual(
      filter.exec(['multi', ['html', 'doctype', '5']]),
      ['multi', ['static', '<!DOCTYPE html>']]
    );

    assert.deepEqual(
      filter.exec(['multi', ['html', 'doctype', '1.1']]),
      ['multi',
        ['static', '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">']
      ]
    );

    done();
  });

  lab.test('compile xml encoding', function(done) {
    assert.deepEqual(
      filter.exec(['html', 'doctype', 'xml latin1']),
      ['static', '<?xml version="1.0" encoding="latin1" ?>']
    );
    done();
  });

  lab.test('compile html comment', function(done) {
    assert.deepEqual(
      filter.exec(['html', 'comment', ['static', 'test']]),
      ['multi', ['static', '<!--'], ['static', 'test'], ['static', '-->']]
    );
    done();
  });

  lab.test('compile js wrapped in comments', function(done) {
    assert.deepEqual(
      filter.exec(['html', 'js', ['static', 'test']]),
      ['multi', ['static', '\n//<![CDATA[\n'], ['static', 'test'], ['static', '\n//]]>\n']]
    );
    done();
  });

  lab.test('compile autoclosed html tag', function(done) {
    assert.deepEqual(
      filter.exec(['html', 'tag',
        'img', ['attrs'],
        ['multi', ['newline']]
      ]),
      ['multi',
        ['static', '<img'],
        ['attrs'],
        ['static', ' />'],
        ['multi', ['newline']]]
    );
    done();
  });

  lab.test('compile explicitly closed html tag', function(done) {
    assert.deepEqual(
      filter.exec(['html', 'tag', 'closed', ['attrs']]),

      ['multi',
        ['static', '<closed'],
        ['attrs'],
        ['static', ' />']
      ]
    );
    done();
  });

  lab.test('compile html with content', function(done) {
    assert.deepEqual(
      filter.exec(['html', 'tag',
      'div', ['attrs'], ['content']]),
      ['multi',
        ['static', '<div'],
        ['attrs'],
        ['static', '>'],
        ['content'],
        ['static', '</div>']
      ]
    );
    done();
  });

  lab.test('compile html with attrs', function(done) {
    assert.deepEqual(
      filter.exec(['html', 'tag', 'div',
        ['html', 'attrs',
          ['html', 'attr', 'id', ['static', 'test']],
          ['html', 'attr', 'class', ['dynamic', 'block']]],
        ['content']
      ]),
      ['multi',
        ['static', '<div'],
        ['multi',
          ['multi', ['static', ' id="'], ['static', 'test'], ['static', '"']],
          ['multi', ['static', ' class="'], ['dynamic', 'block'], ['static', '"']]],
        ['static', '>'],
        ['content'],
        ['static', '</div>']
      ]);
    done();
  });

  lab.test('keep codes intact', function(done) {
    assert.deepEqual(filter.exec(['multi', ['code', 'foo']]), ['multi', ['code', 'foo']]);
    done();
  });

  lab.test('should keep statics intact', function(done) {
    assert.deepEqual(filter.exec(['multi', ['static', '<']]), ['multi', ['static', '<']]);
    done();
  });

  lab.test('should keep dynamic intact', function(done) {
    assert.deepEqual(filter.exec(['multi', ['dynamic', 'foo']]), ['multi', ['dynamic', 'foo']]);
    done();
  });

});
