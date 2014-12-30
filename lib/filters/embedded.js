var Slm = require('./slm');

function TextCollector() {}
var TextProto = TextCollector.prototype = new Slm();

TextProto.exec = function(exp) {
  this._collected = '';
  Slm.prototype.exec.call(this, exp);
  return this._collected;
};

TextProto.on_slm_interpolate = function(exps) {
  this._collected += exps[2];
};

function NewlineCollector() {}
var NewlineProto = NewlineCollector.prototype = new Slm();

NewlineProto.exec = function(exp) {
  this._collected = ['multi'];
  Slm.prototype.exec.call(this, exp);
  return this._collected;
};

NewlineProto.on_newline = function() {
  this._collected.push(['newline']);
};

function Engine() {
  this._textCollector = new TextCollector();
  this._newlineCollector = new NewlineCollector();
}
var EngineProto = Engine.prototype = new Slm();

EngineProto.collectText = function(body) {
  return this._textCollector.exec(body);
};

EngineProto.collectNewlines = function(body) {
  return this._newlineCollector.exec(body);
};

function Javascript(options) {
  this._withType = options && options.typeAttribute;
}
Javascript.prototype = new Engine();

Javascript.prototype.on_slm_embedded = function(exps) {
  var body = exps[3];
  if (this._withType) {
    return ['html', 'tag', 'script',['html', 'attrs',
      ['html', 'attr', 'type', ['static', 'text/javascript']]], body];
  }
  return ['html', 'tag', 'script', ['html', 'attrs'], body];
};

function CSS(){}
CSS.prototype = new Engine();

CSS.prototype.on_slm_embedded = function(exps) {
  var body = exps[3];
  return ['html', 'tag', 'style', ['html', 'attrs',
    ['html', 'attr', 'type', ['static', 'text/css']]], body];
};

function Embedded() {
  this._engines = {};
}

var EmbeddedProto = Embedded.prototype = new Slm();

EmbeddedProto.register = function(name, filter) {
  this._engines[name] = filter;
};

EmbeddedProto.on_slm_embedded = function(exps) {
  var name = exps[2];
  var engine = this._engines[name];
  if (!engine) {
    throw new Error('Embedded engine ' + name + ' is not registered.');
  }
  return this._engines[name].on_slm_embedded(exps);
};

var InterpolateEngine = function(renderer) {
  this.renderer = renderer;
};

var InterpolateProto = InterpolateEngine.prototype = new Engine();

InterpolateProto.on_slm_embedded = function(exps) {
  var body = exps[3];
  var text = this.collectText(body);
  return ['multi', ['slm', 'interpolate', this.renderer(text)]];
};

module.exports = {
  Embedded: Embedded,
  Javascript: Javascript,
  CSS: CSS,
  TextCollector: TextCollector,
  NewlineCollector: NewlineCollector,
  InterpolateEngine: InterpolateEngine
};
