var Engine = require('./engine'),
  Parser = require('./parser'),
  Interpolation = require('./filters/interpolation'),
  Splat = require('./filters/splat'),
  Controls = require('./filters/controls'),
  Controls = require('./filters/controls'),
  FastHtml = require('./html/fast'),
  Escape = require('./filters/escape'),
  MultiFlattener = require('./filters/multi_flattener'),
  StaticMerger = require('./filters/static_merger'),
  StringGenerator = require('./generators/string_generator'),
  Utils = require('./utils');

function Template() {
  this.engine = new Engine;

  this.engine.use(new Parser);
  this.engine.use(new Interpolation);
  this.engine.use(new Splat);
  this.engine.use(new Controls);
  this.engine.use(new FastHtml);
  this.engine.use(new Escape);
  this.engine.use(new MultiFlattener);
  this.engine.use(new StaticMerger);
  this.engine.use(new StringGenerator);
}

Template.prototype.render = function(src) {
  var res = 'var escapeRE = /[&<>\"]/;var escapeAmpRE = /&/g;var escapeLtRE = /</g;var escapeGtRE = />/g; var escapeQuotRE = /"/g;'
  return 'function(context) {\n' + res + Utils.escape.toString() + ';' + Utils.safe.toString() + '; var slm = {escape: escape, safe: safe}; ' + this.engine.exec(src) + '}';
};

Template.prototype.eval = function(src, context) {
  return this.exec(src).call(context);
};

Template.prototype.exec = function(src) {
  return eval('[' + this.render(src) + ']')[0];
};

module.exports = Template;
