var Slm = require('./slm');

function TextCollector() {}
var TextProto = TextCollector.prototype = new Slm();

TextProto.exec = function(exp) {
  this._collected = ''
  Slm.prototype.exec.call(this, exp);
  return this._collected;
}

TextProto.on_slm_interpolate = function(exps) {
  this._collected += exps[2];
  return null;
}

function NewlineCollector() {}
var NewlineProto = NewlineCollector.prototype = new Slm();

NewlineProto.exec = function(exp) {
  this._collected = ['multi'];
  Slm.prototype.exec.call(this, exp);
  return this._collected;
}

NewlineProto.on_newline = function() {
  this._collected.push(['newline']);
  return null;
}

function Engine() {
  this._textCollector = new TextCollector();
  this._newlineCollector = new NewlineCollector();
}
var EngineProto = Engine.prototype = new Slm();

EngineProto.collectText = function(body) {
  return this._textCollector.exec(body);
}

EngineProto.collectNewlines = function(body) {
  return this._newlineCollector.exec(body);
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
