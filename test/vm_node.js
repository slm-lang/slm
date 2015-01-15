var Lab = require('lab');
var Template = require('../lib/template');
var assert  = require('chai').assert;
var FS = require('fs');

var lab = exports.lab = Lab.script();

lab.experiment('VMNode', function() {
  var fixture = {};

  lab.before(function(done) {
    fixture = {};
    fixture.template = new Template(require('../lib/vm_node'));
    fixture.VM = fixture.template.VM;
    fixture.vm = new fixture.VM();
    fixture.vm.resetCache();
    done();
  });

  lab.test('extend with same path', function(done) {
    var options = {
      basePath: '/'
    };

    options.filename = '/layout.slm';
    fixture.vm.cache(options.filename, fixture.template.exec([
      'html',
      '  head',
      '    = content("head")',
      '  body',
      '    = content()'
    ].join('\n'), options, fixture.vm));

    options.filename = '/view.slm';
    var src = [
      '- extend("layout")',
      '= content("head")',
      '  meta name="keywords" content=this.who',
      'p Hello, ${this.who}'
    ].join('\n');


    var result = fixture.template.render(src, {who: 'World', what: 'the best'}, options, fixture.vm);
    assert.deepEqual(result, '<html><head><meta content="World" name="keywords" /></head><body><p>Hello, World</p></body></html>');
    done();
  });

  lab.test('extend with abs path', function(done) {
    var options = {
      basePath: '/views'
    };

    options.filename = '/views/layout.slm';
    fixture.vm.cache('/views/layout.slm', fixture.template.exec([
      'html',
      '  head',
      '    = content("head")',
      '  body',
      '    = content()'
    ].join('\n'), options, fixture.vm));

    options.filename = '/views/view';
    var src = [
      '- extend("/layout")',
      '= content("head");',
      '  meta name="keywords" content=this.who',
      'p Hello, ${this.who}'
    ].join('\n');

    var result = fixture.template.render(src, {who: 'World', what: 'the best'}, options, fixture.vm);
    assert.deepEqual(result, '<html><head><meta content="World" name="keywords" /></head><body><p>Hello, World</p></body></html>');
    done();
  });

  lab.test('extend with same nested path', function(done) {
    var options = {
      basePath: '/'
    };

    options.filename = '/views/layout.slm';
    fixture.vm.cache(options.filename, fixture.template.exec([
      'html',
      '  head',
      '    = content("head")',
      '  body',
      '    = content()'
    ].join('\n'), {}, fixture.vm));

    options.filename = '/views/view.slm';

    var src = [
      '- extend("layout")',
      '= content("head");',
      '  meta name="keywords" content=this.who',
      'p Hello, ${this.who}'
    ].join('\n');

    var result = fixture.template.render(src, {who: 'World', what: 'the best'}, options, fixture.vm);
    assert.deepEqual(result, '<html><head><meta content="World" name="keywords" /></head><body><p>Hello, World</p></body></html>');
    done();
  });

  lab.test('extend with same nested path 2', function(done) {
    var options = {
      basePath: '/views'
    };
    options.filename = '/views/layouts/app.slm';
    fixture.vm.cache(options.filename, fixture.template.exec([
      'html',
      '  head',
      '    = content("head")',
      '  body',
      '    = content()'
    ].join('\n'), options, fixture.vm));

    options.filename = '/views/products/form.slm';
    fixture.vm.cache(options.filename, fixture.template.exec([
      'form',
      '  input type="submit"'
    ].join('\n'), options, fixture.vm));

    options.filename = '/views/products/new.slm';

    var src = [
      '- extend("../layouts/app")',
      '= content("head");',
      '  meta name="keywords" content=this.who',
      '= partial("form", this)'
    ].join('\n');

    var result = fixture.template.render(src, {who: 'World', what: 'the best'}, options, fixture.vm);
    assert.deepEqual(result, '<html><head><meta content="World" name="keywords" /></head><body><form><input type="submit" /></form></body></html>');
    done();
  });

  lab.test('test require', function(done) {
    var options = {
      basePath: '/views',
      require: module.require
    };

    options.filename = '/views/forms/form.slm';
    var src = [
      '- var p = require("path")',
      'p = p.extname("super.slm")'
    ].join('\n');

    var result = fixture.template.render(src, {}, options, fixture.vm);
    assert.deepEqual(result, '<p>.slm</p>');

    done();
  });

  lab.test('test content default', function(done) {
    var options = {
      basePath: '/views'
    };

    options.filename = '/views/layouts/app.slm';

    fixture.vm.cache(options.filename, fixture.template.exec([
      'html',
      '  head',
      '    = content("title", "default")',
      '      title Default title',
      '  body',
      '    = content()'
    ].join('\n'), options, fixture.vm));

    options.filename = '/views/forms/form.slm';
    var src = [
      '- extend("../layouts/app")',
      'p Body from view'
    ].join('\n');

    var result = fixture.template.render(src, {}, options, fixture.vm);
    assert.deepEqual(result, '<html><head><title>Default title</title></head><body><p>Body from view</p></body></html>');

    var src2 = [
      '- extend("../layouts/app")',
      '= content("title")',
      '  title New title',
      'p Body from view'
    ].join('\n');

    var result2 = fixture.template.render(src2, {}, options, fixture.vm);
    assert.deepEqual(result2, '<html><head><title>New title</title></head><body><p>Body from view</p></body></html>');
    done();
  });

  lab.test('test content append', function(done) {
    var options = {
      basePath: '/views'
    };

    options.filename = '/views/layouts/app.slm';

    fixture.vm.cache(options.filename, fixture.template.exec([
      'html',
      '  head',
      '    = content("title")',
      '  body',
      '    = content()'
    ].join('\n'), options, fixture.vm));

    options.filename = '/views/forms/form.slm';
    var src = [
      '- extend("../layouts/app")',
      '= content("title", "append")',
      '  title 1',
      'p Body from view'
    ].join('\n');

    var result = fixture.template.render(src, {}, options, fixture.vm);
    assert.deepEqual(result, '<html><head><title>1</title></head><body><p>Body from view</p></body></html>');

    var src2 = [
      '- extend("../layouts/app")',
      '= content("title", "prepend")',
      '  title 2',
      'p Body from view'
    ].join('\n');

    var result2 = fixture.template.render(src2, {}, options, fixture.vm);
    assert.deepEqual(result2, '<html><head><title>2</title></head><body><p>Body from view</p></body></html>');
    done();
  });


  lab.test('test view loading', function(done) {
    var options = {
      basePath: __dirname + '/views',
      filename: __dirname + '/views/index.slm'
    };

    var src = FS.readFileSync(options.filename, 'utf8');

    var compile = require('../lib/slm').compile;

    var fn1 = compile(src, options);
    var res1 = fn1({});
    options.useCache = true;
    var fn2 = compile(src, options);
    var res2 = fn2({});
    options.useCache = false;
    var fn3 = compile(src, options);
    var res3 = fn3({});
    var expected = '<!DOCTYPE html><html><head><title>Nice</title><style type="text/css">body {background :red};</style></head><body><h1>Partial</h1><p>This is new footer</p></body><script>console.log(\'script\');</script><script type="text/javascript">console.log(\'javascript\');</script></html>';
    assert.deepEqual(res1, expected);
    assert.deepEqual(res2, expected);
    assert.deepEqual(res3, expected);

    done();
  });

  lab.test('test resolvePath', function(done) {
    var options = {
      filename: __dirname + '/views/index.slm'
    };

    var src = FS.readFileSync(options.filename, 'utf8');

    var compile = require('../lib/slm').compile;

    var fn1 = compile(src, options);
    assert.throw(function() {
      fn1({});
    }, 'the "basePath" option is required to use with "absolute" paths');

    var fn2 = compile(src, {});
    assert.throw(function() {
      fn2({});
    }, 'the "filename" option is required to use with "relative" paths');

    done();
  });
});
