var Lab = require('lab');
var Generator = require('../../lib/generators/string');
var assert  = require('chai').assert;

var lab = exports.lab = Lab.script();

lab.experiment('String generator', function() {
  var generator = null;

  lab.before(function(done) {
    generator = new Generator();
    done();
  });


  lab.test('compiles simple expressions', function(done) {
    assert.deepEqual(generator.exec(['static', 'test']), 'var _b=\'\';_b+="test";');
    assert.deepEqual(generator.exec(['dynamic', 'test']), 'var _b=\'\';_b+=test;');
    assert.deepEqual(generator.exec(['code', 'test']), 'var _b=\'\';test');
    done();
  });

  lab.test('compiles multi expression', function(done) {
    assert.deepEqual(generator.exec(['multi',
                                    ['static', 'static'],
                                    ['dynamic', 'dynamic'],
                                    ['code', 'code']])
    , 'var _b=\'\';_b+="static";\n_b+=dynamic;\ncode');
    done();
  });

  lab.test('throws an error on unknown expression', function(done) {
    assert.throw(function() {
      generator.exec(['multi',
        ['unknown', 'static'],
        ['code', 'code']]);
    }, 'Generator supports only core expressions - found ["unknown","static"]');
    done();
  });
});
