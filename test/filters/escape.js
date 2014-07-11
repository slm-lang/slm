var Lab = require('lab'),
    Escape = require('../../lib/filters/escape');

var suite   = Lab.experiment;
var before  = Lab.before;
var after   = Lab.after;
var test    = Lab.test
var assert  = Lab.assert

suite("Escape", function() {

  var filter;

  before(function(done) {
    filter = new Escape;
    done();
  });

  test('handle escape expressions', function(done){
    assert.deepEqual(
      filter.exec(['escape', true,
                    ['multi',
                     ['static', 'a < b'],
                     ['dynamic', 'this.jsMethod()']]
      ]),
      ['multi',
        ['static', 'a &lt; b'],
        ['dynamic', 'slm.escape(this.jsMethod())'],
      ]
    );
    done();
  });

  test('keep codes intact', function(done) {
    assert.deepEqual(filter.exec(['multi', ['code', 'foo']]), ['multi', ['code', 'foo']]);
    done();
  });

  test('keep statics intact', function(done) {
    assert.deepEqual(filter.exec(['multi', ['static', '<']]), ['multi', ['static', '<']]);
    done();
  });

  test('keep dynamic intact', function(done) {
    assert.deepEqual(filter.exec(['multi', ['dynamic', 'foo']]), ['multi', ['dynamic', 'foo']]);
    done();
  });

  test('use htmlSafe flag', function(done) {
    // filter = Temple::Filters::Escapable.new(:use_html_safe => true)
    var src = new String('a < b');
    src.htmlSafe = true;
    assert.deepEqual(
      filter.exec(['escape', true, ['static', src]]),
      ['static', src]
    );
    done();
  });

});
