var Slm = require('./slm');

function TextCollector() {}
var TextProto = TextCollector.prototype = new Slm();

TextProto.exec = function(exp) {
  this.collected = ''
  Slm.prototype.exec.call(this, exp);
  return this.collected;
}

TextProto.on_slm_interpolate = function(exps) {
  this.collected += exps[2];
  return null;
}

function NewlineCollector() {}
var NewlineProto = NewlineCollector.prototype = new Slm();

NewlineProto.exec = function(exp) {
  this.collected = ['multi'];
  Slm.prototype.exec.call(this, exp);
  return this.collected;
}

NewlineProto.on_newline = function() {
  this.collected.push(['newline']);
  return null;
}

function Engine() {
  this.textCollector = new TextCollector();
  this.newlineCollector = new NewlineCollector();
}
var EngineProto = Engine.prototype = new Slm();

EngineProto.collectText = function(body) {
  return this.textCollector.exec(body);
}

EngineProto.collectNewlines = function(body) {
  return this.newlineCollector.exec(body);
}

function JavascriptEngine() {}
JavascriptEngine.prototype = new Engine();

JavascriptEngine.prototype.on_slm_embedded = function(exps) {
  var engine = exps[2], body = exps[3];
  return ['html', 'tag', 'script',['html', 'attrs',
    ['html', 'attr', 'type', ['static', 'text/javascript']]], body];
}

function CSSEngine(){}
CSSEngine.prototype = new Engine();

CSSEngine.prototype.on_slm_embedded = function(exps) {
  var engine = exps[2], body = exps[3];
  return ['html', 'tag', 'style', ['html', 'attrs',
    ['html', 'attr', 'type', ['static', 'text/css']]], body];
}

function Embedded() {
  this.engines = {}
}

var EmbeddedProto = Embedded.prototype = new Slm();

EmbeddedProto.register = function(name, filter) {
  this.engines[name] = filter;
};

EmbeddedProto.on_slm_embedded = function(exps) {
  var name = exps[2], body = 3;
  var engine = this.engines[name];
  if (!engine) {
    throw new Error('Embedded engine ' + name + ' is not registered.')
  }
  return this.engines[name].on_slm_embedded(exps);
}

exports.Embedded = Embedded;
exports.JavascriptEngine = JavascriptEngine;
exports.CSSEngine = CSSEngine;
exports.TextCollector = TextCollector;
exports.NewlineCollector = NewlineCollector;
