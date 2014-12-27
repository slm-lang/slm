var Lab = require('lab');
var Template = require('../../lib/template');
var assert  = require('chai').assert;
var assertHtml = require('../helper').assertHtml;

var lab = exports.lab = Lab.script();

lab.experiment('Code structure', function() {
  var template;
  lab.before(function(done) {
    template = new Template();
    done();
  });

  lab.test('render with conditional', function(done) {
    assertHtml(template, [
      'div',
      '  - if this.showFirst()',
      '      p The first paragraph',
      '  - else',
      '      p The second paragraph'
      ],
      '<div><p>The second paragraph</p></div>',
      {}, done);
  });


  lab.test('render with consecutive conditionals', function(done) {
    assertHtml(template, [
      'div',
      '  - if this.showFirst(true)',
      '      p The first paragraph',
      '  - if this.showFirst(true)',
      '      p The second paragraph'
      ],
      '<div><p>The first paragraph</p><p>The second paragraph</p></div>',
      {}, done);
  });

  lab.test('render with when string in condition', function(done) {
    assertHtml(template, [
      '- if true',
      '  | Hello',

      '- if "when" !== null',
      '  |  world'
      ],
      'Hello world',
      {}, done);
  });

  lab.test('render with conditional and following nonconditonal', function(done) {
    assertHtml(template, [
      'div',
      '  - if true',
      '      p The first paragraph',
      '  - var x = 42',
      '  = x'
      ],
      '<div><p>The first paragraph</p>42</div>',
      {}, done);
  });

  lab.test('render with case', function(done) {
    assertHtml(template, [
      '- var url = require("url")',
      '- console.log(url.format({protocol: "http"}))',
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
      '  |  is the answer'
      ],
      '<p>42 is the answer</p><p>41 is the answer</p><p>42 is the answer</p><p>41 is the answer</p>',
      {}, done);
  });

  lab.test('render with slim comments', function(done) {
    assertHtml(template, [
      'p Hello',
      '/ This is a comment',
      '  Another comment',
      'p World'
      ],
      '<p>Hello</p><p>World</p>',
      {}, done);
  });

  lab.test('render with try catch', function(done) {
    assertHtml(template, [
      '- try',
      '  p Try',
      '- catch error',
      '  p Catch',
      'p After'
      ],
      '<p>Try</p><p>After</p>',
      {}, done);
  });

  lab.test('render with try catch exception', function(done) {
    assertHtml(template, [
      '- try',
      '  p Try',
      '  - throw "Boom"',
      '  p After Boom',
      '- catch ex',
      '  p = ex',
      'p After'
      ],
      '<p>Try</p><p>Boom</p><p>After</p>',
      {}, done);
  });

  lab.test('render with try catch finally', function(done) {
    assertHtml(template, [
      '- try',
      '  p Try',
      '  - throw "Boom"',
      '  p After Boom',
      '- catch ex',
      '  p = ex',
      '- finally',
      '  p Finally',
      'p After'
      ],
      '<p>Try</p><p>Boom</p><p>Finally</p><p>After</p>',
      {}, done);
  });

  lab.test('injects callback arg', function(done) {
    assertHtml(template, [
      '= this.block()',
      '  p Block',
      'p After'
      ],
      '<p>Block</p><p>After</p>',
      {}, done);
  });

  lab.test('content', function(done) {
    assertHtml(template, [
      '= content()',
      'p After 1',
      '= content("head")',
      'p After 2',
      '= content(false)',
        'title title1',
      'p After 3',
      '= content("head")',
        'title title2',
      'p After 4',
      '= content("head")'
      ],
      '<p>After 1</p><p>After 2</p><title>title1</title><p>After 3</p><title>title2</title><p>After 4</p>',
      {}, done);
  });
});
