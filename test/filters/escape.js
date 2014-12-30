var Lab = require('lab');
var Escape = require('../../lib/filters/escape');
var assert  = require('chai').assert;

var lab = exports.lab = Lab.script();


lab.experiment('Escape', function() {

  var filter;

  lab.before(function(done) {
    filter = new Escape();
    done();
  });

  lab.test('handle escape expressions', function(done){
    assert.deepEqual(
      filter.exec(['escape', true,
                    ['multi',
                     ['static', 'a < b'],
                     ['dynamic', 'this.jsMethod()']]
      ]),
      ['multi',
        ['static', 'a &lt; b'],
        ['dynamic', 'vm.escape(this.jsMethod())']
      ]
    );
    done();
  });

  lab.test('keep codes intact', function(done) {
    assert.deepEqual(filter.exec(['multi', ['code', 'foo']]), ['multi', ['code', 'foo']]);
    done();
  });

  lab.test('keep statics intact', function(done) {
    assert.deepEqual(filter.exec(['multi', ['static', '<']]), ['multi', ['static', '<']]);
    done();
  });

  lab.test('keep dynamic intact', function(done) {
    assert.deepEqual(filter.exec(['multi', ['dynamic', 'foo']]), ['multi', ['dynamic', 'foo']]);
    done();
  });

  lab.test('use htmlSafe flag', function(done) {
    var src = new String('a < b');
    src.htmlSafe = true;
    assert.deepEqual(
      filter.exec(['escape', true, ['static', src]]),
      ['static', src + '']
    );
    done();
  });

});
