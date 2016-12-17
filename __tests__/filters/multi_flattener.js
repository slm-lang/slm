var MultiFlattener = require('../../lib/filters/multi_flattener');

describe('MultiFlattener', function() {

  var filter;

  beforeEach(function() {
    filter = new MultiFlattener();
  });

  test('flatten nested multi expressions', function() {
    expect(
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
      )).toEqual(['multi',
        ['static', 'a'],
        ['dynamic', 'aa'],
        ['static', 'aaa'],
        ['static', 'aab'],
        ['dynamic', 'ab'],
        ['static', 'b']
      ]);
  });
});
