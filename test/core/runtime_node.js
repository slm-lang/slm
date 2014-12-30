var Lab = require('lab');
var Template = require('../../lib/template');
var assert  = require('chai').assert;
var assertHtml = require('../helper').assertHtml;

var lab = exports.lab = Lab.script();

lab.experiment('Ctx', function() {
  var fixture = {};

  lab.before(function(done) {
    fixture = {};
    fixture.template = new Template(require('../../lib/runtime_node'));
    fixture.Ctx = fixture.template.rt.Ctx;
    fixture.ctx = new fixture.Ctx();
    fixture.Ctx.cache = {};
    done();
  });

  lab.test('extend with same path', function(done) {
      var compileOptions = {
        basePath: '/'
      };

      compileOptions.filename = '/layout.slm',
      fixture.Ctx.cache[compileOptions.filename] = fixture.template.exec([
        'html',
        '  head',
        '    - console.log(0)',
        '    = content("head")',
        '  body',
        '    = content()'
        ].join('\n'), compileOptions, fixture.ctx);

      compileOptions.filename = "/view.slm";
      var src = [
        '- extend("layout")',
        '- console.log(1)',
        '= content("head")',
        '  - console.log(2)',
        '  meta name="keywords" content=this.who',
        'p Hello, ${this.who}'
      ].join('\n');


      var result = fixture.template.eval(src, {who: 'World', what: 'the best'}, compileOptions, fixture.ctx);
      assert.deepEqual(result, '<html><head><meta content="World" name="keywords" /></head><body><p>Hello, World</p></body></html>');
      done();
  });

  lab.test('extend with abs path', function(done) {
      var compileOptions = {
        basePath: '/views'
      };

      compileOptions.filename = '/views/layout.slm';
      fixture.Ctx.cache['/views/layout.slm'] = fixture.template.exec([
        'html',
        '  head',
        '    = content("head")',
        '  body',
        '    = content()'
        ].join('\n'), compileOptions, fixture.ctx);

      compileOptions.filename = '/views/view';
      var src = [
        '- extend("/layout")',
        '= content("head");',
        '  meta name="keywords" content=this.who',
        'p Hello, ${this.who}'
      ].join('\n');

      var result = fixture.template.eval(src, {who: 'World', what: 'the best'}, compileOptions, fixture.ctx);
      assert.deepEqual(result, '<html><head><meta content="World" name="keywords" /></head><body><p>Hello, World</p></body></html>');
      done();
  });

  lab.test('extend with same nested path', function(done) {
      var compileOptions = {
        basePath: '/'
      };

      compileOptions.filename = '/views/layout.slm';
      fixture.Ctx.cache[compileOptions.filename] = fixture.template.exec([
        'html',
        '  head',
        '    = content("head")',
        '  body',
        '    = content()'
        ].join('\n'), {}, fixture.ctx);

      compileOptions.filename = '/views/view.slm';

      var src = [
        '- extend("layout")',
        '= content("head");',
        '  meta name="keywords" content=this.who',
        'p Hello, ${this.who}'
      ].join('\n');

      var result = fixture.template.eval(src, {who: 'World', what: 'the best'}, compileOptions, fixture.ctx);
      assert.deepEqual(result, '<html><head><meta content="World" name="keywords" /></head><body><p>Hello, World</p></body></html>');
      done();
  });

  lab.test('extend with same nested path 2', function(done) {
      var compileOptions = {
        basePath: '/views'
      };

      console.log('!!!!!!!!!!!!!!!!!!!!', fixture.ctx);


      compileOptions.filename = '/views/layouts/app.slm';
      fixture.Ctx.cache[compileOptions.filename] = fixture.template.exec([
        'html',
        '  head',
        '    = content("head")',
        '  body',
        '    = content()'
        ].join('\n'), compileOptions, fixture.ctx);

      compileOptions.filename = '/views/products/form.slm';
      fixture.Ctx.cache[compileOptions.filename] = fixture.template.exec([
        'form',
        '  input type="submit"'
        ].join('\n'), compileOptions, fixture.ctx);

      compileOptions.filename = '/views/products/new.slm';

      var src = [
        '- extend("../layouts/app")',
        '= content("head");',
        '  meta name="keywords" content=this.who',
        '= partial("form", this)'
      ].join('\n');

      var result = fixture.template.eval(src, {who: 'World', what: 'the best'}, compileOptions, fixture.ctx);
      assert.deepEqual(result, '<html><head><meta content="World" name="keywords" /></head><body><form><input type="submit" /></form></body></html>');
      done();
  });

  lab.test('test require', function(done) {
      var compileOptions = {
        basePath: '/views',
        require: module.require
      };

      compileOptions.filename = '/views/forms/form.slm';
      var src = [
        '- var p = require("path")',
        'p = p.extname("super.slm")'
      ].join('\n');

      var result = fixture.template.eval(src, {}, compileOptions, fixture.ctx);
      assert.deepEqual(result, '<p>.slm</p>');

      done();
  });


  lab.test('test predefined', function(done) {
      var compileOptions = {
        basePath: '/views'
      };

      compileOptions.filename = '/views/layouts/app.slm';

      fixture.Ctx.cache[compileOptions.filename] = fixture.template.exec([
        'html',
        '  head',
        '    = predefined("title")',
        '      title Default title',
        '  body',
        '    = content()'
        ].join('\n'), compileOptions, fixture.ctx);

      compileOptions.filename = '/views/forms/form.slm';
      var src = [
        '- extend("../layouts/app")',
        'p Body from view'
      ].join('\n');

      var result = fixture.template.eval(src, {}, compileOptions, fixture.ctx);
      assert.deepEqual(result, '<html><head><title>Default title</title></head><body><p>Body from view</p></body></html>');

      var src2 = [
        '- extend("../layouts/app")',
        '= content("title")',
        '  title New title',
        'p Body from view'
      ].join('\n');

      var result = fixture.template.eval(src2, {}, compileOptions, fixture.ctx);
      assert.deepEqual(result, '<html><head><title>New title</title></head><body><p>Body from view</p></body></html>');
      done();
  });
});
