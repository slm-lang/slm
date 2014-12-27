var Lab = require('lab');
var MultiFlattener = require('../../lib/filters/multi_flattener');
var assert  = require('chai').assert;

var lab = exports.lab = Lab.script();

lab.experiment('MultiFlattener', function() {

  var filter;

  lab.before(function(done) {
    filter = new MultiFlattener();
    done();
  });

  lab.test('flatten nested multi expressions', function(done) {
    assert.deepEqual(
      filter.exec(
        [
          'multi',
          ['static', 'a'],
          [
            'multi',
            ['dynamic', 'aa'],
            [
              'multi',
              ['static', 'aaa'],
              ['static', 'aab']
            ],
            ['dynamic', 'ab']
          ],
          ['static', 'b']
        ]
      ),  ['multi',
        ['static', 'a'],
        ['dynamic', 'aa'],
        ['static', 'aaa'],
        ['static', 'aab'],
        ['dynamic', 'ab'],
        ['static', 'b']
      ]);
    done();
  });
});
