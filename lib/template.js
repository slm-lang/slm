var Engine = require('./engine'),
  Parser = require('./parser'),
  Embeddeds = require('./filters/embedded'),
  Interpolate = require('./filters/interpolate'),
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
  StringGenerator = require('./generators/string'),
  Runtime = require('./runtime'),

  Ctx = require('./ctx');

function Template() {
  this._engine = new Engine();
  this._embedded = new Embeddeds.Embedded;
  var jsEngine = new Embeddeds.JavascriptEngine;
  this._embedded.register('script', jsEngine);
  this._embedded.register('javascript', jsEngine);
  this._embedded.register('css', new Embeddeds.CSSEngine);

  this._engine.use(new Parser);
  this._engine.use(this._embedded);
  this._engine.use(new Interpolate);
  this._engine.use(new Brackets);
  this._engine.use(new Controls);
  this._engine.use(new AttrMerge);
  this._engine.use(new CodeAttributes);
  this._engine.use(new AttrRemove);
  this._engine.use(new FastHtml);
  this._engine.use(new Escape);
  this._engine.use(new ControlFlow);
  this._engine.use(new MultiFlattener);
  this._engine.use(new StaticMerger);
  this._engine.use(new StringGenerator);
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
    this._engine.exec(src, options),
    'c.res=_b;return c.pop(sp);'
  ].join(''));
};

Template.prototype.compile = function(src, options) {
  var fn = this.exec(src, options);
  var ctx = new Ctx();
  ctx.template = this;
  ctx.basePath = options['basePath'];
  ctx.filename = options['filename'];
  ctx.require = require;
  ctx.rt = Runtime;

  var fnWrap = function(context, runtimeOptions) {
    var res = fn.call(context, ctx);
    ctx.reset();
    return res;
  }
  return fnWrap;
}

module.exports = Template;
