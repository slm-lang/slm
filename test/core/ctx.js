var Lab = require('lab'),
    Template = require('../../lib/template'),
    Ctx = require('../../lib/ctx');

var suite   = Lab.experiment;
var before  = Lab.before;
var after   = Lab.after;
var test    = Lab.test
var assert  = Lab.assert

suite('Ctx', function() {
  var template;
  before(function(done) {
    template = new Template
    done();
  });

  test('extend with same path', function(done) {
      Ctx.cache = {};
      var ctx = new Ctx();
      ctx.filename = 'view.slm'

      Ctx.cache['layout.slm'] = template.exec([
        'html',
        '  head',
        '    = content("head")',
        '  body',
        '    = content()'
        ].join('\n'), {}, ctx);

      var src = [
        '- extend("layout")',
        '= content("head");',
        '  meta name="keywords" content=this.who',
        'p Hello, ${this.who}'
      ].join('\n')


      var result = template.eval(src, {who: 'World', what: 'the best'}, {}, ctx);
      assert.deepEqual(result, '<html><head><meta content="World" name="keywords" /></head><body><p>Hello, World</p></body></html>');
      done();
  });

  test('extend with abs path', function(done) {
      Ctx.cache = {};

      var ctx = new Ctx();
      ctx.filename = '/views/view';
      ctx.basePath = '/';

      Ctx.cache['/layout.slm'] = template.exec([
        'html',
        '  head',
        '    = content("head")',
        '  body',
        '    = content()'
        ].join('\n'), {}, ctx)

      var src = [
        '- extend("/layout")',
        '= content("head");',
        '  meta name="keywords" content=this.who',
        'p Hello, ${this.who}'
      ].join('\n')

      var result = template.eval(src, {who: 'World', what: 'the best'}, {}, ctx);
      assert.deepEqual(result, '<html><head><meta content="World" name="keywords" /></head><body><p>Hello, World</p></body></html>');
      done();
  });

  test('extend with same nested path', function(done) {
      Ctx.cache = {};
      var ctx = new Ctx();
      ctx.filename = '/views/view.slm';
      ctx.basePath = '/';

      Ctx.cache['/views/layout.slm'] = template.exec([
        'html',
        '  head',
        '    = content("head")',
        '  body',
        '    = content()'
        ].join('\n'), {}, ctx);

      var src = [
        '- extend("layout")',
        '= content("head");',
        '  meta name="keywords" content=this.who',
        'p Hello, ${this.who}'
      ].join('\n')

      var result = template.eval(src, {who: 'World', what: 'the best'}, {}, ctx);
      assert.deepEqual(result, '<html><head><meta content="World" name="keywords" /></head><body><p>Hello, World</p></body></html>');
      done();
  });

  test('extend with same nested path 2', function(done) {
      Ctx.cache = {};

      var ctx = new Ctx();
      ctx.filename = '/views/products/new.slm';
      ctx.basePath = '/views';

      Ctx.cache['/views/layouts/app.slm'] = template.exec([
        'html',
        '  head',
        '    = content("head")',
        '  body',
        '    = content()'
        ].join('\n'), {}, ctx);

      Ctx.cache['/views/products/form.slm'] = template.exec([
        'form',
        '  input type="submit"',
        ].join('\n'), {}, ctx);


      var src = [
        '- extend("../layouts/app")',
        '= content("head");',
        '  meta name="keywords" content=this.who',
        '= partial("form", this)'
      ].join('\n')

      var result = template.eval(src, {who: 'World', what: 'the best'}, {}, ctx);
      assert.deepEqual(result, '<html><head><meta content="World" name="keywords" /></head><body><form><input type="submit" /></form></body></html>');
      done();
  });
});
