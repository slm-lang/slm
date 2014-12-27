var Lab = require('lab');
var StaticMerger = require('../../lib/filters/static_merger');
var assert  = require('chai').assert;

var lab = exports.lab = Lab.script();


lab.experiment('StaticMerger', function() {

  var filter;

  lab.before(function(done) {
    filter = new StaticMerger();
    done();
  });

  lab.test('merge serveral statics', function(done) {
    assert.deepEqual(
      filter.exec(['multi',
        ['static', 'Hello '],
        ['static', 'World, '],
        ['static', 'Good night']
      ]),
      ['static', 'Hello World, Good night']
    );

    done();
  });

  lab.test('merge serveral statics around code', function(done) {
    assert.deepEqual(
      filter.exec(['multi',
        ['static', 'Hello '],
        ['static', 'World!'],
        ['code', '123'],
        ['static', 'Good night, '],
        ['static', 'everybody']
      ])
      , ['multi',
        ['static', 'Hello World!'],
        ['code', '123'],
        ['static', 'Good night, everybody']
      ]);
    done();
  });

  lab.test('merge serveral statics across newlines', function(done) {
    assert.deepEqual(
      filter.exec(['multi',
        ['static', 'Hello '],
        ['static', 'World, '],
        ['newline'],
        ['static', 'Good night']
      ])
      , ['multi',
        ['static', 'Hello World, Good night'],
        ['newline']
    ]);
    done();
  });
});
