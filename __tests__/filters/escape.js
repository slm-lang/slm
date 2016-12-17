var Escape = require('../../lib/filters/escape');

describe('Escape', function() {

  var filter;

  beforeEach(function() {
    filter = new Escape();
  });

  test('handle escape expressions', function(){
    expect(
      filter.exec(['escape', true,
                    ['multi',
                     ['static', 'a < b'],
                     ['dynamic', 'this.jsMethod()']]
      ])).toEqual(
      ['multi',
        ['static', 'a &lt; b'],
        ['dynamic', 'vm.escape(this.jsMethod())']
      ]
    );
  });

  test('keep codes intact', function() {
    expect(filter.exec(['multi', ['code', 'foo']])).toEqual(['multi', ['code', 'foo']]);
  });

  test('keep statics intact', function() {
    expect(filter.exec(['multi', ['static', '<']])).toEqual(['multi', ['static', '<']]);
  });

  test('keep dynamic intact', function() {
    expect(filter.exec(['multi', ['dynamic', 'foo']])).toEqual(['multi', ['dynamic', 'foo']]);
  });

  test('use htmlSafe flag', function() {
    var src = new String('a < b');
    src.htmlSafe = true;
    expect(
      filter.exec(['escape', true, ['static', src]])
    ).toEqual(
      ['static', src + '']
    );
  });

});
