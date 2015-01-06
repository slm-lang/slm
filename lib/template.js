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

function Template(VM, options) {

  options = options || {
    mergeAttrs: { 'class': ' ' }
  };

  this.VM = VM;
  this._engine = new Engine();
  this.Embeddeds = Embeddeds;

  this._embedded = new Embeddeds.Embedded();

  this.registerEmbedded('script',     new Embeddeds.Javascript());
  this.registerEmbedded('javascript', new Embeddeds.Javascript({typeAttribute: true}));
  this.registerEmbedded('css',        new Embeddeds.CSS());

  var filters = this._defaultFilters(options);
  for (var i = 0, il = filters.length; i < il; i++) {
    this._engine.use(filters[i]);
  }
}

Template.prototype._defaultFilters = function(options) {
  return [
    new Parser(),
    this._embedded,
    new Interpolate(),
    new Brackets(),
    new Controls(),
    new AttrMerge(options.mergeAttrs),
    new CodeAttributes(options.mergeAttrs),
    new AttrRemove(options.mergeAttrs),
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

Template.prototype.eval = function(src, model, options, vm) {
  vm = vm || new this.VM();
  return this.compile(src, options, vm)(model, vm);
};

Template.prototype.compile = function(src, options, vm) {
  vm = vm || new this.VM();

  var fn = this.exec(src, options, vm);

  var fnWrap = function(model, runtimeOptions) {
    var res = fn.call(model, vm);
    vm.reset();
    return res;
  };
  return fnWrap;
};

Template.prototype.exec = function(src, options, vm) {
  options = options || {};

  if (options.useCache !== undefined && !options.useCache) {
    vm._load = vm._loadWithoutCache;
  }

  vm.template = this;
  vm.basePath = options.basePath;
  vm.filename = options.filename;
  vm.require  = options.require || module.require;
  vm.rebind();

  return vm.runInContext(this.src(src, options), vm.filename)[0];
};

Template.prototype.src = function(src, options) {
  return [
    '[function(vm) {',
    'vm.m = this;',
    'var sp = vm.stack.length, require = vm.require, content = vm._content, extend = vm._extend, partial = vm._partial;',
    this._engine.exec(src, options),
    'vm.res=_b;return vm.pop(sp);}]'
  ].join('');
};

Template.prototype.exports = function() {
  return {
    Template: Template,
    template: this,
    compile:  this.compile.bind(this),
    eval:     this.eval.bind(this)
  };
};

module.exports = Template;
