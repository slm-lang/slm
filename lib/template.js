var AttrMerge = require('./filters/attr_merge');
var AttrRemove = require('./filters/attr_remove');
var Brackets = require('./filters/brackets');
var CodeAttributes = require('./filters/code_attributes');
var ControlFlow = require('./filters/control_flow');
var Controls = require('./filters/controls');
var Embeddeds = require('./filters/embedded');
var Engine = require('./engine');
var Escape = require('./filters/escape');
var FastHtml = require('./html/fast');
var Interpolate = require('./filters/interpolate');
var MultiFlattener = require('./filters/multi_flattener');
var Parser = require('./parser');
var StaticMerger = require('./filters/static_merger');
var StringGenerator = require('./generators/string');

function Template(runtime) {
  this.rt = runtime;
  this._engine = new Engine();
  this.Embeddeds = Embeddeds;

  this._embedded = new Embeddeds.Embedded();

  this.registerEmbedded('script',     new Embeddeds.Javascript());
  this.registerEmbedded('javascript', new Embeddeds.Javascript({typeAttribute: true}));
  this.registerEmbedded('css',        new Embeddeds.CSS());

  var filters = this._defaultFilters();
  for (var i = 0, f; f = filters[i]; i++) {
    this._engine.use(f);
  }
}

Template.prototype._defaultFilters = function() {
  return [
    new Parser(),
    this._embedded,
    new Interpolate(),
    new Brackets(),
    new Controls(),
    new AttrMerge(),
    new CodeAttributes(),
    new AttrRemove(),
    new FastHtml(),
    new Escape(),
    new ControlFlow(),
    new MultiFlattener(),
    new StaticMerger(),
    new StringGenerator()
  ];
};

Template.prototype.registerEmbedded = function(name, engine) {
  this._embedded.register(name, engine);
};

Template.prototype.registerEmbeddedFunction = function(name, renderer) {
  var engine = new this.Embeddeds.InterpolateEngine(renderer);
  this.registerEmbedded(name, engine);
};

Template.prototype.eval = function(src, model, options, ctx) {
  ctx = ctx || new this.rt.Ctx()
  return this.compile(src, options, ctx)(model, ctx);
};

Template.prototype.compile = function(src, compileOptions, ctx) {
  var ctx = ctx || new this.rt.Ctx();

  var fn = this.exec(src, compileOptions, ctx);

  var fnWrap = function(model, runtimeOptions) {
    var res = fn.call(model, ctx);
    ctx.reset();
    return res;
  };
  return fnWrap;
};

Template.prototype.exec = function(src, compileOptions, ctx) {
  var rt = this.rt;

  compileOptions = compileOptions || {};

  if (compileOptions.useCache !== undefined && !compileOptions.useCache) {
    ctx._load = ctx._loadWithoutCache;
  }

  ctx.template = this;
  ctx.basePath = compileOptions.basePath;
  ctx.filename = compileOptions.filename;
  ctx.require = compileOptions.require || module.require;
  ctx.rebind();

  return eval(this.src(src, compileOptions))[0];
};

Template.prototype.src = function(src, compileOptions) {
  return [
    '[function(c) {',
    'c.m = this;',
    'var sp = c.stack.length, require = c.require, content = c._content, extend = c._extend, partial = c._partial, predefined = c._predefined, append = c._append, prepend = c._prepend;',
    this._engine.exec(src, compileOptions),
    'c.res=_b;return c.pop(sp);}]'
  ].join('');
};


module.exports = Template;
