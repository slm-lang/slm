var Lab = require('lab'),
    Template = require('../../lib/template'),
    assertHtml = require('../helper').assertHtml;

var suite   = Lab.experiment;
var before  = Lab.before;
var after   = Lab.after;
var test    = Lab.test
var assert  = Lab.assert

suite('Code output', function() {
  var template;
  before(function(done) {
    template = new Template
    done();
  });

  test('render with call', function(done) {
    assertHtml(template, [
      'p',
      '  = this.helloWorld',
      ],
      '<p>Hello World from @env</p>',
      {}, done);
  });

  test('render with trailing whitespace', function(done) {
    assertHtml(template, [
      'p',
      '  =. this.helloWorld',
      ],
      '<p>Hello World from @env </p>',
      {}, done);
  });

  test('render with trailing whitespace after tag', function(done) {
    assertHtml(template, [
      'p=. this.helloWorld',
      ],
      '<p>Hello World from @env</p> ',
      {}, done);
  });

  test('no escape render with trailing whitespace', function(done) {
    assertHtml(template, [
      'p',
      '  ==. this.helloWorld',
      ],
      '<p>Hello World from @env </p>',
      {}, done);
  });

  test('no escape render with trailing whitespace after tag', function(done) {
    assertHtml(template, [
      'p==. this.helloWorld',
      ],
      '<p>Hello World from @env</p> ',
      {}, done);
  });

  test('no escape render with trailing whitespace after tag', function(done) {
    assertHtml(template, [
      'p==. this.helloWorld',
      ],
      '<p>Hello World from @env</p> ',
      {}, done);
  });

  test('render with backslash end', function(done) {
    assertHtml(template, [
      'p = \\',
      '"Hello" + \\',
      '" JS!"',
      '- var variable = 1 + \\',
      '      2 + \\',
      ' 3',
      '= variable + \\',
      '  1',
      ],
      '<p>Hello JS!</p>7',
      {}, done);
  });

  test('render with comma end', function(done) {
    assertHtml(template, [
      'p = this.message("Hello",',
      '                 "JS!")',
      ],
      '<p>Hello JS!</p>',
      {}, done);
  });


});
