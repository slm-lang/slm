var Filter = require('../filter'),
    Runtime = require('../runtime');

function Escape() {
  this.disableEscape = false;
  this.escape = false;
  this.escaper = Runtime.escape;
}

var EscapeProto = Escape.prototype = new Filter;

EscapeProto.escapeCode = function(v) {
  return 'slm.escape(' + v + ')';
}

EscapeProto.on_escape = function(exps) {
  var old = this.escape;
  this.escape = exps[1] && !this.disableEscape;
  try {
    return this.compile(exps[2]);
  } finally {
    this.escape = old;
  }
}

EscapeProto.on_static = function(exps) {
  return ['static', this.escape ? this.escaper(exps[1]) : exps[1]];
}

EscapeProto.on_dynamic = function(exps) {
  return ['dynamic', this.escape ? this.escapeCode(exps[1]) : exps[1]];
}

module.exports = Escape;
