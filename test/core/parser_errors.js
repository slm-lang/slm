var Lab = require('lab'),
    Template = require('../../lib/template'),
    assertSyntaxError = require('../helper').assertSyntaxError;

var suite   = Lab.experiment;
var before  = Lab.before;
var after   = Lab.after;
var test    = Lab.test
var assert  = Lab.assert

suite('Parser errors', function() {
  var template;
  before(function(done) {
    template = new Template
    done();
  });

  test('correct filename', function(done) {
    assertSyntaxError(template, [
      'doctype 5',
      '  div Invalid',
      ],
      'Unexpected indentation\n  test.slm, Line 2, Column 3\n    div Invalid\n    ^\n',
      {file: 'test.slm'}, done);
  });

  test('unexpected indentation', function(done) {
    assertSyntaxError(template, [
      'doctype 5',
      '  div Invalid',
      ],
      'Unexpected indentation\n  (__TEMPLATE__), Line 2, Column 3\n    div Invalid\n    ^\n',
      {}, done);
  });

  test('unexpected text indentation', function(done) {
    assertSyntaxError(template, [
      'p',
      '  | text block',
      '   text',
      ],
      'Text line not indented deep enough.\nThe first text line defines the necessary text indentation.\n  (__TEMPLATE__), Line 3, Column 4\n     text\n     ^\n',
      {}, done);
  });

  test('unexpected text indentation in tag', function(done) {
    assertSyntaxError(template, [
      'ul',
      '  li List1',
      '    ul',
      '      li a',
      '      li b',
      '  li List2',
      '    ul',
      '      li a',
      '      li b',
      ],
      'Text line not indented deep enough.\nThe first text line defines the necessary text indentation.\nAre you trying to nest a child tag in a tag containing text? Use | for the text block!\n  (__TEMPLATE__), Line 3, Column 5\n      ul\n      ^\n',
      {}, done);
  });

  test('malformed indentation', function(done) {
    assertSyntaxError(template, [
      'p',
      '  div Valid',
      ' div Invalid',
      ],
      'Malformed indentation\n  (__TEMPLATE__), Line 3, Column 2\n   div Invalid\n   ^\n',
      {}, done);
  });

  test('unknown line indicator', function(done) {
    assertSyntaxError(template, [
      'p',
      '  div Valid',
      '  .valid',
      '  #valid',
      '  ?invalid',
      ],
      'Unknown line indicator\n  (__TEMPLATE__), Line 5, Column 3\n    ?invalid\n    ^\n',
      {}, done);
  });

  test('expected closing delimiter', function(done) {
    assertSyntaxError(template, [
      'p',
      '  img(src="img.jpg" title=(title)',
      ],
      'Expected closing delimiter )\n  (__TEMPLATE__), Line 2, Column 34\n    img(src=\"img.jpg\" title=(title)\n                                   ^\n',
      {}, done);
  });

  test('expected closing quote', function(done) {
    assertSyntaxError(template, [
      'p',
      '  img(src="img.jpg',
      ],
      'Expected closing quote \"\n  (__TEMPLATE__), Line 2, Column 19\n    img(src=\"img.jpg\n                    ^\n',
      {}, done);
  });

  test('expected closing attribute delimiter', function(done) {
    assertSyntaxError(template, [
      'p',
      '  img src=[hash[1] + hash[2]',
      ],
      'Expected closing delimiter ]\n  (__TEMPLATE__), Line 2, Column 29\n    img src=[hash[1] + hash[2]\n                              ^\n',
      {}, done);
  });

  test('invalid empty attribute', function(done) {
    assertSyntaxError(template, [
      'p',
      '  img[src= ]',
      ],
      'Invalid empty attribute\n  (__TEMPLATE__), Line 2, Column 12\n    img[src= ]\n             ^\n',
      {}, done);
  });

  test('invalid empty attribute 2', function(done) {
    assertSyntaxError(template, [
      'p',
      '  img[src=]',
      ],
      'Invalid empty attribute\n  (__TEMPLATE__), Line 2, Column 11\n    img[src=]\n            ^\n',
      {}, done);
  });

  test('invalid empty attribute 3', function(done) {
    assertSyntaxError(template, [
      'p',
      '  img src=',
      ],
      'Invalid empty attribute\n  (__TEMPLATE__), Line 2, Column 11\n    img src=\n            ^\n',
      {}, done);
  });

  test('missing tag in block expansion', function(done) {
    assertSyntaxError(template, [
      'html: body:',
      ],
      'Expected tag\n  (__TEMPLATE__), Line 1, Column 12\n  html: body:\n             ^\n',
      {}, done);
  });

  test('invalid tag in block expansion', function(done) {
    assertSyntaxError(template, [
      'html: body: /comment',
      ],
      'Expected tag\n  (__TEMPLATE__), Line 1, Column 13\n  html: body: /comment\n              ^\n',
      {});

    assertSyntaxError(template, [
      'html: body:/comment',
      ],
      'Expected tag\n  (__TEMPLATE__), Line 1, Column 12\n  html: body:/comment\n             ^\n',
      {}, done);
  });

  test('unexpected text after closed', function(done) {
    assertSyntaxError(template, [
      'img / text',
      ],
      'Unexpected text after closed tag\n  (__TEMPLATE__), Line 1, Column 7\n  img / text\n        ^\n',
      {}, done);
  });

  test('illegal shortcuts', function(done) {
    assertSyntaxError(template, [
      '.#test',
      ],
      'Illegal shortcut\n  (__TEMPLATE__), Line 1, Column 1\n  .#test\n  ^\n',
      {}, done);
  });

  test('illegal shortcuts', function(done) {
    assertSyntaxError(template, [
      '.#test',
      ],
      'Illegal shortcut\n  (__TEMPLATE__), Line 1, Column 1\n  .#test\n  ^\n',
      {});

    assertSyntaxError(template, [
      'div.#test',
      ],
      'Illegal shortcut\n  (__TEMPLATE__), Line 1, Column 4\n  div.#test\n     ^\n',
      {}, done);
  });

});
