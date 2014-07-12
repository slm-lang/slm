var Filter = require('../filter');
var Utils = require('../utils');

function Escape() {
  this.disableEscape = false;
  this.escape = false;
  this.escaper = Utils.escape;
};

Escape.prototype = new Filter;

(function() {

  this.escapeCode = function(v) {
    return 'slm.escape(' + v + ')';
  };
  this.escaper = function(v) {
    return v;
  }

  this.on_escape = function(exps) {
    var old = this.escape;
    this.escape = exps[1] && !this.disableEscape;
    try {
      return this.compile(exps[2]);
    } finally {
      this.escape = old;
    }
  };

  this.on_static = function(exps) {
    return ['static', this.escape ? this.escaper(exps[1]) : exps[1]];
  };

  this.on_dynamic = function(exps) {
    return ['dynamic', this.escape ? this.escapeCode(exps[1]) : exps[1]];
  };
}).call(Escape.prototype);

module.exports = Escape;
