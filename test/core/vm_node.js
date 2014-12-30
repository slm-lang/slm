var Lab = require('lab');
var Template = require('../../lib/template');
var assert  = require('chai').assert;
var assertHtml = require('../helper').assertHtml;

var lab = exports.lab = Lab.script();

lab.experiment('VMNode', function() {
  var fixture = {};

  lab.before(function(done) {
    fixture = {};
    fixture.template = new Template(require('../../lib/vm_node'));
    fixture.VM = fixture.template.VM;
    fixture.vm = new fixture.VM();
    fixture.VM.cache = {};
    done();
  });

  lab.test('extend with same path', function(done) {
      var compileOptions = {
        basePath: '/'
      };

      compileOptions.filename = '/layout.slm';
      fixture.VM.cache[compileOptions.filename] = fixture.template.exec([
        'html',
        '  head',
        '    = content("head")',
        '  body',
        '    = content()'
        ].join('\n'), compileOptions, fixture.vm);

      compileOptions.filename = '/view.slm';
      var src = [
        '- extend("layout")',
        '= content("head")',
        '  meta name="keywords" content=this.who',
        'p Hello, ${this.who}'
      ].join('\n');


      var result = fixture.template.eval(src, {who: 'World', what: 'the best'}, compileOptions, fixture.vm);
      assert.deepEqual(result, '<html><head><meta content="World" name="keywords" /></head><body><p>Hello, World</p></body></html>');
      done();
  });

  lab.test('extend with abs path', function(done) {
      var compileOptions = {
        basePath: '/views'
      };

      compileOptions.filename = '/views/layout.slm';
      fixture.VM.cache['/views/layout.slm'] = fixture.template.exec([
        'html',
        '  head',
        '    = content("head")',
        '  body',
        '    = content()'
        ].join('\n'), compileOptions, fixture.vm);

      compileOptions.filename = '/views/view';
      var src = [
        '- extend("/layout")',
        '= content("head");',
        '  meta name="keywords" content=this.who',
        'p Hello, ${this.who}'
      ].join('\n');

      var result = fixture.template.eval(src, {who: 'World', what: 'the best'}, compileOptions, fixture.vm);
      assert.deepEqual(result, '<html><head><meta content="World" name="keywords" /></head><body><p>Hello, World</p></body></html>');
      done();
  });

  lab.test('extend with same nested path', function(done) {
      var compileOptions = {
        basePath: '/'
      };

      compileOptions.filename = '/views/layout.slm';
      fixture.VM.cache[compileOptions.filename] = fixture.template.exec([
        'html',
        '  head',
        '    = content("head")',
        '  body',
        '    = content()'
        ].join('\n'), {}, fixture.vm);

      compileOptions.filename = '/views/view.slm';

      var src = [
        '- extend("layout")',
        '= content("head");',
        '  meta name="keywords" content=this.who',
        'p Hello, ${this.who}'
      ].join('\n');

      var result = fixture.template.eval(src, {who: 'World', what: 'the best'}, compileOptions, fixture.vm);
      assert.deepEqual(result, '<html><head><meta content="World" name="keywords" /></head><body><p>Hello, World</p></body></html>');
      done();
  });

  lab.test('extend with same nested path 2', function(done) {
      var compileOptions = {
        basePath: '/views'
      };
      compileOptions.filename = '/views/layouts/app.slm';
      fixture.VM.cache[compileOptions.filename] = fixture.template.exec([
        'html',
        '  head',
        '    = content("head")',
        '  body',
        '    = content()'
        ].join('\n'), compileOptions, fixture.vm);

      compileOptions.filename = '/views/products/form.slm';
      fixture.VM.cache[compileOptions.filename] = fixture.template.exec([
        'form',
        '  input type="submit"'
        ].join('\n'), compileOptions, fixture.vm);

      compileOptions.filename = '/views/products/new.slm';

      var src = [
        '- extend("../layouts/app")',
        '= content("head");',
        '  meta name="keywords" content=this.who',
        '= partial("form", this)'
      ].join('\n');

      var result = fixture.template.eval(src, {who: 'World', what: 'the best'}, compileOptions, fixture.vm);
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

      var result = fixture.template.eval(src, {}, compileOptions, fixture.vm);
      assert.deepEqual(result, '<p>.slm</p>');

      done();
  });


  lab.test('test content default', function(done) {
      var compileOptions = {
        basePath: '/views'
      };

      compileOptions.filename = '/views/layouts/app.slm';

      fixture.VM.cache[compileOptions.filename] = fixture.template.exec([
        'html',
        '  head',
        '    = content("title", "default")',
        '      title Default title',
        '  body',
        '    = content()'
        ].join('\n'), compileOptions, fixture.vm);

      compileOptions.filename = '/views/forms/form.slm';
      var src = [
        '- extend("../layouts/app")',
        'p Body from view'
      ].join('\n');

      var result = fixture.template.eval(src, {}, compileOptions, fixture.vm);
      assert.deepEqual(result, '<html><head><title>Default title</title></head><body><p>Body from view</p></body></html>');

      var src2 = [
        '- extend("../layouts/app")',
        '= content("title")',
        '  title New title',
        'p Body from view'
      ].join('\n');

      result2 = fixture.template.eval(src2, {}, compileOptions, fixture.vm);
      assert.deepEqual(result2, '<html><head><title>New title</title></head><body><p>Body from view</p></body></html>');
      done();
  });

  lab.test('test content append', function(done) {
      var compileOptions = {
        basePath: '/views'
      };

      compileOptions.filename = '/views/layouts/app.slm';

      fixture.VM.cache[compileOptions.filename] = fixture.template.exec([
        'html',
        '  head',
        '    = content("title")',
        '  body',
        '    = content()'
        ].join('\n'), compileOptions, fixture.vm);

      compileOptions.filename = '/views/forms/form.slm';
      var src = [
        '- extend("../layouts/app")',
        '= content("title", "append")',
        '  title 1',
        'p Body from view'
      ].join('\n');

      var result = fixture.template.eval(src, {}, compileOptions, fixture.vm);
      assert.deepEqual(result, '<html><head><title>1</title></head><body><p>Body from view</p></body></html>');

      var src2 = [
        '- extend("../layouts/app")',
        '= content("title", "prepend")',
        '  title 2',
        'p Body from view'
      ].join('\n');

      var result2 = fixture.template.eval(src2, {}, compileOptions, fixture.vm);
      assert.deepEqual(result2, '<html><head><title>2</title></head><body><p>Body from view</p></body></html>');
      done();
  });
});
