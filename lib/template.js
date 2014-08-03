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

  this._embedded = new Embeddeds.Embedded();

  this._embedded.register('script',     new Embeddeds.Javascript);
  this._embedded.register('javascript', new Embeddeds.Javascript({typeAttribute: true}));
  this._embedded.register('css',        new Embeddeds.CSS);

  var filters = [
    new Parser,
    this._embedded,
    new Interpolate,
    new Brackets,
    new Controls,
    new AttrMerge,
    new CodeAttributes,
    new AttrRemove,
    new FastHtml,
    new Escape,
    new ControlFlow,
    new MultiFlattener,
    new StaticMerger,
    new StringGenerator,
  ];
  for (var i = 0, f; f = filters[i]; i++) {
    this._engine.use(f);
  }
}

Template.prototype.eval = function(src, model, options, ctx) {
  ctx = ctx || new Ctx();

  var content = ctx.content.bind(ctx);
  var extend = ctx.extend.bind(ctx);
  var partial = ctx.partial.bind(ctx);
  var rt = Runtime;
  ctx.rt = rt;

  var fn = eval(this.src(src, options))[0];

  return fn.call(model, ctx);
};

Template.prototype.exec = function(src, options, ctx) {
  ctx = ctx || new Ctx();

  var content = ctx.content.bind(ctx);
  var extend = ctx.extend.bind(ctx);
  var partial = ctx.partial.bind(ctx);
  var rt = Runtime;

  return eval(this.src(src, options))[0];
};

Template.prototype.src = function(src, compileOptions) {
  return [
    '[function(c) {',
    'c.m = this;',
    'var sp = c.stack.length;',
    this._engine.exec(src, compileOptions),
    'c.res=_b;return c.pop(sp);}]'
  ].join('');
}

Template.prototype.compile = function(src, compileOptions) {
  compileOptions = compileOptions || {};
  var ctx = new Ctx();
  ctx.template = this;
  ctx.basePath = compileOptions['basePath'];
  ctx.filename = compileOptions['filename'];

  var content = ctx.content.bind(ctx);
  var extend = ctx.extend.bind(ctx);
  var partial = ctx.partial.bind(ctx);
  var rt = Runtime;
  ctx.rt = rt;

  var fn = eval(this.src(src, compileOptions))[0];

  var fnWrap = function(context, runtimeOptions) {
    var res = fn.call(context, ctx);
    ctx.reset();
    return res;
  };
  return fnWrap;
};


module.exports = Template;
