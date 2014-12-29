var Lab = require('lab');
var Template = require('../../lib/template');
var assert  = require('chai').assert;
var assertHtml = require('../helper').assertHtml;

var lab = exports.lab = Lab.script();

lab.experiment('Ctx', function() {
  var template;
  lab.before(function(done) {
    template = new Template(require('../../lib/runtime_node'));
    done();
  });

  lab.test('extend with same path', function(done) {
      template.rt.Ctx.cache = {};
      var ctx = new template.rt.Ctx();

      var compileOptions = {
        filename: "/layout.slm",
        basePath: "/"
      };

      template.rt.Ctx.cache[compileOptions.filename] = template.exec([
        'html',
        '  head',
        '    = content("head")',
        '  body',
        '    = content()'
        ].join('\n'), compileOptions, ctx);

      compileOptions.filename = "/view.slm";

      var src = [
        '- extend("layout")',
        '= content("head");',
        '  meta name="keywords" content=this.who',
        'p Hello, ${this.who}'
      ].join('\n');


      var result = template.eval(src, {who: 'World', what: 'the best'}, compileOptions, ctx);
      assert.deepEqual(result, '<html><head><meta content="World" name="keywords" /></head><body><p>Hello, World</p></body></html>');
      done();
  });

  lab.test('extend with abs path', function(done) {
      template.rt.Ctx.cache = {};

      var compileOptions = {
        filename: '/views/layout.slm',
        basePath: '/views'
      }

      var ctx = new template.rt.Ctx();

      template.rt.Ctx.cache['/views/layout.slm'] = template.exec([
        'html',
        '  head',
        '    = content("head")',
        '  body',
        '    = content()'
        ].join('\n'), compileOptions, ctx);

      compileOptions.filename = '/views/view';

      var src = [
        '- extend("/layout")',
        '= content("head");',
        '  meta name="keywords" content=this.who',
        'p Hello, ${this.who}'
      ].join('\n');

      var result = template.eval(src, {who: 'World', what: 'the best'}, compileOptions, ctx);
      assert.deepEqual(result, '<html><head><meta content="World" name="keywords" /></head><body><p>Hello, World</p></body></html>');
      done();
  });

  lab.test('extend with same nested path', function(done) {
      template.rt.Ctx.cache = {};
      var ctx = new template.rt.Ctx();

      var compileOptions = {
        filename: '/views/layout.slm',
        basePath: '/'
      };

      template.rt.Ctx.cache[compileOptions.filename] = template.exec([
        'html',
        '  head',
        '    = content("head")',
        '  body',
        '    = content()'
        ].join('\n'), {}, ctx);

      compileOptions.filename = '/views/view.slm';

      var src = [
        '- extend("layout")',
        '= content("head");',
        '  meta name="keywords" content=this.who',
        'p Hello, ${this.who}'
      ].join('\n');

      var result = template.eval(src, {who: 'World', what: 'the best'}, compileOptions, ctx);
      assert.deepEqual(result, '<html><head><meta content="World" name="keywords" /></head><body><p>Hello, World</p></body></html>');
      done();
  });

  lab.test('extend with same nested path 2', function(done) {
      template.rt.Ctx.cache = {};

      var compileOptions = {
        filename: '/views/layouts/app.slm',
        basePath: '/views'
      };

      var ctx = new template.rt.Ctx();

      template.rt.Ctx.cache[compileOptions.filename] = template.exec([
        'html',
        '  head',
        '    = content("head")',
        '  body',
        '    = content()'
        ].join('\n'), compileOptions, ctx);

      compileOptions.filename = '/views/products/form.slm';

      template.rt.Ctx.cache[compileOptions.filename] = template.exec([
        'form',
        '  input type="submit"'
        ].join('\n'), compileOptions, ctx);

      compileOptions.filename = '/views/products/new.slm';

      var src = [
        '- extend("../layouts/app")',
        '= content("head");',
        '  meta name="keywords" content=this.who',
        '= partial("form", this)'
      ].join('\n');

      var result = template.eval(src, {who: 'World', what: 'the best'}, compileOptions, ctx);
      assert.deepEqual(result, '<html><head><meta content="World" name="keywords" /></head><body><form><input type="submit" /></form></body></html>');
      done();
  });

  lab.test('test require', function(done) {
      template.rt.Ctx.cache = {};

      var compileOptions = {
        filename: '/views/layouts/app.slm',
        basePath: '/views'
      }

      var ctx = new template.rt.Ctx();

      template.rt.Ctx.cache[compileOptions.filename] = template.exec([
        'html',
        '  head',
        '    = defaultContent("title")',
        '      title Default title',
        '  body',
        '    = content()'
        ].join('\n'), compileOptions, ctx);

      compileOptions.filename = '/views/forms/form.slm';

      var src = [
        '- extend("../layouts/app")',
        'p Body from view'
      ].join('\n');

      var result = template.eval(src, {}, compileOptions, ctx);
      assert.deepEqual(result, '<html><head><title>Default title</title></head><body><p>Body from view</p></body></html>');

      var src2 = [
        '- extend("../layouts/app")',
        '= content("title")',
        '  title New title',
        'p Body from view'
      ].join('\n');

      var result = template.eval(src2, {}, compileOptions, ctx);
      assert.deepEqual(result, '<html><head><title>New title</title></head><body><p>Body from view</p></body></html>');
      done();
  });

  lab.test('test defaultContent', function(done) {
      template.rt.Ctx.cache = {};

      var compileOptions = {
        filename: '/views/layouts/app.slm',
        basePath: '/views'
      }

      var ctx = new template.rt.Ctx();

      template.rt.Ctx.cache[compileOptions.filename] = template.exec([
        'html',
        '  head',
        '    = defaultContent("title")',
        '      title Default title',
        '  body',
        '    = content()'
        ].join('\n'), compileOptions, ctx);

      compileOptions.filename = '/views/forms/form.slm';

      var src = [
        '- extend("../layouts/app")',
        'p Body from view'
      ].join('\n');

      var result = template.eval(src, {}, compileOptions, ctx);
      assert.deepEqual(result, '<html><head><title>Default title</title></head><body><p>Body from view</p></body></html>');

      var src2 = [
        '- extend("../layouts/app")',
        '= content("title")',
        '  title New title',
        'p Body from view'
      ].join('\n');

      var result = template.eval(src2, {}, compileOptions, ctx);
      assert.deepEqual(result, '<html><head><title>New title</title></head><body><p>Body from view</p></body></html>');
      done();
  });

  lab.test('test defaultContent', function(done) {
      template.rt.Ctx.cache = {};

      var compileOptions = {
        filename: '/views/layouts/app.slm',
        basePath: '/views'
      }

      var ctx = new template.rt.Ctx();

      template.rt.Ctx.cache[compileOptions.filename] = template.exec([
        'html',
        '  head',
        '    = defaultContent("title")',
        '      title Default title',
        '  body',
        '    = content()'
        ].join('\n'), compileOptions, ctx);

      compileOptions.filename = '/views/forms/form.slm';

      var src = [
        '- extend("../layouts/app")',
        'p Body from view'
      ].join('\n');

      var result = template.eval(src, {}, compileOptions, ctx);
      assert.deepEqual(result, '<html><head><title>Default title</title></head><body><p>Body from view</p></body></html>');

      var src2 = [
        '- extend("../layouts/app")',
        '= content("title")',
        '  title New title',
        'p Body from view'
      ].join('\n');

      var result = template.eval(src2, {}, compileOptions, ctx);
      assert.deepEqual(result, '<html><head><title>New title</title></head><body><p>Body from view</p></body></html>');
      done();
  });
});
