var Filter = require('../filter');
var VM = require('../vm');

function Escape() {
  this._disableEscape = false;
  this._escape = false;
  this._escaper = VM.escape;
}

var p = Escape.prototype = new Filter();

p._escapeCode = function(v) {
  return 'vm.escape(' + v.replace(/;+$/, '') + ')';
};

p.on_escape = function(exps) {
  var old = this.escape;
  this._escape = exps[1] && !this._disableEscape;
  try {
    return this.compile(exps[2]);
  } finally {
    this._escape = old;
  }
};

p.on_static = function(exps) {
  return ['static', this._escape ? this._escaper(exps[1]) : exps[1]];
};

p.on_dynamic = function(exps) {
  return ['dynamic', this._escape ? this._escapeCode(exps[1]) : exps[1]];
};

module.exports = Escape;
