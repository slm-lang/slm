var Lab = require('lab'),
    Template = require('../../lib/template');

var suite   = Lab.experiment;
var before  = Lab.before;
var after   = Lab.after;
var test    = Lab.test
var assert  = Lab.assert

suite("Interpolation", function() {

  var template;
  before(function(done) {
    template = new Template;
    done();
  });

  test('interpolation in attribute', function(done) {
    var src = 'p id="a${this.id_helper}b" = this.hello_world';

    assert.deepEqual(
      template.eval(src, {id_helper: 'someid', hello_world: 'hello world'}),
      '<p id="asomeidb">hello world</p>'
    );
    done();
  });

  // Not yet
  test('nested interpolation in attribute', function(done) {
    var src = 'p id="${"abc${1+1}" + "("}" = this.hello_world';

    assert.deepEqual(
      template.eval(src, {hello_world: 'Hello World from @env'}),
      '<p id="abc${1+1}(">Hello World from @env</p>'
    );

    done();
  });
});
