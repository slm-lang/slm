var Filter = require('../filter'),
    Runtime = require('../runtime');

function Escape() {
  this._disableEscape = false;
  this._escape = false;
  this._escaper = Runtime.escape;
}

var EscapeProto = Escape.prototype = new Filter;

EscapeProto._escapeCode = function(v) {
  return 'rt.escape(' + v.replace(/;+$/, '') + ')';
}

EscapeProto.on_escape = function(exps) {
  var old = this.escape;
  this._escape = exps[1] && !this._disableEscape;
  try {
    return this.compile(exps[2]);
  } finally {
    this._escape = old;
  }
}

EscapeProto.on_static = function(exps) {
  return ['static', this._escape ? this._escaper(exps[1]) : exps[1]];
}

EscapeProto.on_dynamic = function(exps) {
  return ['dynamic', this._escape ? this._escapeCode(exps[1]) : exps[1]];
}

module.exports = Escape;
