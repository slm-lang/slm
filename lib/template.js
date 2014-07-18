var Engine = require('./engine'),
  Parser = require('./parser'),
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
  Utils = require('./utils');

function Template() {
  this.engine = new Engine;

  this.engine.use(new Parser);
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

Template.prototype.render = function(src) {
  var res = 'var escapeRe = /[&<>\"]/;var ampRe = /&/g;var ltRe = /</g;var gtRe = />/g; var quotRe = /"/g;'
  return 'function(context) {\n'
    + res
    + Utils.escape.toString() + ';'
    + Utils.safe.toString() + ';'
    + Utils.rejectEmpty.toString() + ';'
    + Utils.flatten.toString()
    + '; var slm = {escape: escape, safe: safe, rejectEmpty: rejectEmpty, flatten: flatten}; '
    + this.engine.exec(src) + '}';
};

Template.prototype.eval = function(src, context) {
  return this.exec(src).call(context);
};

Template.prototype.exec = function(src) {
  var code = this.render(src);
  return eval('[' + code + ']')[0];
};

module.exports = Template;
