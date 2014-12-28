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
  this.Ctx = runtime.Ctx;
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
  ctx = ctx || new this.Ctx();

  ctx._content = ctx.content.bind(ctx);
  ctx._extend = ctx.extend.bind(ctx);
  ctx._partial = ctx.partial.bind(ctx);
  var rt = this.rt;

  var fn = eval(this.src(src, options))[0];

  return fn.call(model, ctx);
};

Template.prototype.exec = function(src, options, ctx) {
  ctx = ctx || new this.Ctx();

  /*jshint unused:false */

  var content = ctx.content.bind(ctx);
  var extend = ctx.extend.bind(ctx);
  var partial = ctx.partial.bind(ctx);
  var rt = this.rt;

  /*jshint unused:true */

  return eval(this.src(src, options))[0];
};

Template.prototype.src = function(src, compileOptions) {
  return [
    '[function(c) {',
    'c.m = this;',
    'var sp = c.stack.length, content = c._content, extend = c._extend, partial = c._partial;',
    this._engine.exec(src, compileOptions),
    'c.res=_b;return c.pop(sp);}]'
  ].join('');
};

Template.prototype.compile = function(src, compileOptions) {
  compileOptions = compileOptions || {};

  var ctx = new this.Ctx();
  if (compileOptions.useCache !== undefined && !compileOptions.useCache) {
    ctx._load = ctx._loadWithoutCache;
  }

  ctx.template = this;
  ctx.basePath = compileOptions.basePath;
  ctx.filename = compileOptions.filename;

  ctx._content = ctx.content.bind(ctx);
  ctx._extend = ctx.extend.bind(ctx);
  ctx._partial = ctx.partial.bind(ctx);

  var fn = eval(this.src(src, compileOptions))[0];

  var fnWrap = function(context, runtimeOptions) {
    var res = fn.call(context, ctx);
    ctx.reset();
    return res;
  };
  return fnWrap;
};

module.exports = Template;
