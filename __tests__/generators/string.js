var Generator = require('../../lib/generators/string');

describe('String generator', function() {
  var generator = null;

  beforeEach(function() { generator = new Generator(); });

  test('compiles simple expressions', function() {
    expect(generator.exec(['static', 'test'])).toEqual('var _b=\'\';_b+="test";');
    expect(generator.exec(['dynamic', 'test'])).toEqual('var _b=\'\';_b+=test;');
    expect(generator.exec(['code', 'test'])).toEqual('var _b=\'\';test');
  });

  test('compiles multi expression', function() {
    expect(generator.exec(['multi',
      ['static', 'static'],
      ['dynamic', 'dynamic'],
      ['code', 'code']])
    ,).toEqual(
      'var _b=\'\';_b+="static";\n_b+=dynamic;\ncode'
    );
  });

  expect('throws an error on unknown expression', function() {
    expect(function() {
      generator.exec(['multi',
        ['unknown', 'static'],
        ['code', 'code']]);
    }).toThrowError('Generator supports only core expressions - found ["unknown","static"]');
  });
});
