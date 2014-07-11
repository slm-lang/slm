var Lab = require('lab'),
    MultiFlattener = require('../../lib/filters/multi_flattener');

var suite   = Lab.experiment;
var before  = Lab.before;
var after   = Lab.after;
var test    = Lab.test
var assert  = Lab.assert

suite("MultiFlattener", function() {

  var filter;

  before(function(done) {
    filter = new MultiFlattener;
    done();
  });

  test('flatten nested multi expressions', function(done) {
    assert.deepEqual(
      filter.exec(
        [
          'multi',
          ['static', "a"],
          [
            'multi',
            ['dynamic', "aa"],
            [
              'multi',
              ['static', "aaa"],
              ['static', "aab"],
            ],
            ['dynamic', "ab"],
          ],
          ['static', "b"],
        ]
      ),  ['multi',
        ['static', "a"],
        ['dynamic', "aa"],
        ['static', "aaa"],
        ['static', "aab"],
        ['dynamic', "ab"],
        ['static', "b"],
      ]);
    done();
  });
});
