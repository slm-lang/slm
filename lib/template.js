var Engine = require('./engine'),
  Parser = require('./parser'),
  Embeddeds = require('./filters/embedded'),
  Interpolation = require('./filters/interpolation'),
  Brackets = require('./filters/brackets'),
  Controls = require('./filters/controls'),
  AttrMerge = require('./filters/attr_merge'),
  CodeAttributes = require('./filters/code_attributes'),
  AttrRemove = require('./filters/attr_remove'),
  FastHtml = require('./html/fast'),
  Escape = require('./filters/escape'),
  ControlFlow = require('./filters/control_flow'),
  MultiFlattener = require('./filters/multi_flattener'),
  StaticMerger = require('./filters/static_merger'),
  StringGenerator = require('./generators/string_generator'),
  Runtime = require('./runtime'),

  Ctx = require('./ctx');

function Template() {
  this.engine = new Engine;
  this.embedded = new Embeddeds.Embedded;
  var jsEngine = new Embeddeds.JavascriptEngine;
  this.embedded.register('script', jsEngine);
  this.embedded.register('javascript', jsEngine);
  this.embedded.register('css', new Embeddeds.CSSEngine);

  this.engine.use(new Parser);
  this.engine.use(this.embedded);
  this.engine.use(new Interpolation);
  this.engine.use(new Brackets);
  this.engine.use(new Controls);
  this.engine.use(new AttrMerge);
  this.engine.use(new CodeAttributes);
  this.engine.use(new AttrRemove);
  this.engine.use(new FastHtml);
  this.engine.use(new Escape);
  this.engine.use(new ControlFlow);
  this.engine.use(new MultiFlattener);
  this.engine.use(new StaticMerger);
  this.engine.use(new StringGenerator);
}

Template.prototype.eval = function(src, model, options, ctx) {
  ctx = ctx || new Ctx();
  ctx.rt = Runtime;
  ctx.require = require;
  return this.exec(src, options).call(model, ctx);
};

Template.prototype.exec = function(src, options) {
  return Function('c', [
    'c.m = this;',
    'var sp = c.stack.length,',
    'rt = c.rt,',
    'content = c.content.bind(c),',
    'extend = c.extend.bind(c),',
    'partial = c.partial.bind(c),',
    'require = c.require;',
    this.engine.exec(src, options),
    'c.res=_b;return c.pop(sp);'
  ].join(''));
};

Template.prototype.compile = function(src, options) {
  var fn = this.exec(src, options);
  var basePath = options['basePath'];
  var filename = options['filename'];
  var ctx = new Ctx();
  ctx.template = this;
  ctx.basePath = basePath;
  ctx.filename = filename;
  ctx.require = require;
  ctx.rt = Runtime;

  var fnWrap = function(context, runtimeOptions) {
    return fn.call(context, ctx);
  }
  return fnWrap;
}

module.exports = Template;
