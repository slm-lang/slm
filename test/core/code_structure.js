var Lab = require('lab'),
    Template = require('../../lib/template');

var suite   = Lab.experiment;
var before  = Lab.before;
var after   = Lab.after;
var test    = Lab.test
var assert  = Lab.assert

suite('Code structure', function() {
  var template;
  before(function(done) {
    template = new Template
    done();
  });

  test('render with conditional', function(done) {
    var src = [
      'div',
      '  - if this.showFirst',
      '      p The first paragraph',
      '  - else',
      '      p The second paragraph'
    ].join('\n');

    assert.equal(template.eval(src, {showFirst: false}), '<div><p>The second paragraph</p></div>');

    done();
  });


  test('render with consecutive conditionals', function(done) {
    var src = [
      'div',
      '  - if this.showFirst',
      '      p The first paragraph',
      '  - if this.showFirst',
      '      p The second paragraph'
    ].join('\n');

    assert.equal(template.eval(src, {showFirst: true}), '<div><p>The first paragraph</p><p>The second paragraph</p></div>');
    done();
  });

  test('render with when string in condition', function(done) {
    var src = [
      '- if true',
      '  | Hello',

      '- if "when" !== null',
      '  |  world'
    ].join('\n');

    assert.equal(template.eval(src, {}), 'Hello world');
    done();
  });

  test('render with conditional and following nonconditonal', function(done) {
    var src = [
      'div',
      '  - if true',
      '      p The first paragraph',
      '  - var x = 42',
      '  = x',
    ].join('\n');

    assert.equal(template.eval(src, {}), '<div><p>The first paragraph</p>42</div>')
    done();
  });

  test('render with case', function(done) {
    var src = [
      'p',
      '  - switch(42)',
      '    - case 41:',
      '      | 41',
      '      - break',
      '    - case 42:',
      '      | 42',
      '      - break',
      '  |  is the answer',
      'p',
      '  - switch(41)',
      '    - case 41:',
      '      | 41',
      '      - break',
      '    - case 42:',
      '      | 42',
      '      - break',
      '  |  is the answer',
      'p',
      '  - switch(42)',
      '    - case 41:',
      '      | 41',
      '      - break',
      '    - case 42:',
      '      | 42',
      '      - break',
      '  |  is the answer',
      'p',
      '  - switch(41)',
      '    - case 41:',
      '      | 41',
      '      - break',
      '    - case 42:',
      '      | 42',
      '      - break',
      '  |  is the answer',
    ].join('\n')

    assert.equal(template.eval(src, {}), '<p>42 is the answer</p><p>41 is the answer</p><p>42 is the answer</p><p>41 is the answer</p>');
    done();
  });


});
