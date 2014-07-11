var Lab = require('lab'),
    StaticMerger = require('../../lib/filters/static_merger');

var suite   = Lab.experiment;
var before  = Lab.before;
var after   = Lab.after;
var test    = Lab.test
var assert  = Lab.assert

suite("StaticMerger", function() {

  var filter;

  before(function(done) {
    filter = new StaticMerger;
    done();
  });

  test('merge serveral statics', function(done) {
    assert.deepEqual(
      filter.exec(['multi',
        ['static', "Hello "],
        ['static', "World, "],
        ['static', "Good night"]
      ]),
      ['static', "Hello World, Good night"]
    );

    done();
  });

  test('merge serveral statics around code', function(done) {
    assert.deepEqual(
      filter.exec(['multi',
        ['static', "Hello "],
        ['static', "World!"],
        ['code', "123"],
        ['static', "Good night, "],
        ['static', "everybody"]
      ])
      , ['multi',
        ['static', "Hello World!"],
        ['code', "123"],
        ['static', "Good night, everybody"]
      ]);
    done();
  });

  test('merge serveral statics across newlines', function(done) {
    assert.deepEqual(
      filter.exec(['multi',
        ['static', "Hello "],
        ['static', "World, "],
        ['newline'],
        ['static', "Good night"]
      ])
      , ['multi',
        ['static', "Hello World, Good night"],
        ['newline']
    ]);
    done();
  });
});
