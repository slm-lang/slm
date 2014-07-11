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

  this.on_escape = function(flag, exps) {
    var old = this.escape;
    this.escape = flag && !this.disableEscape;
    try {
      return this.compile(exps[0]);
    } finally {
      this.escape = old;
    }
  };

  this.on_static = function(value, exps) {
    return ['static', this.escape ? this.escaper(value) : value];
  };

  this.on_dynamic = function(value, exps) {
    return ['dynamic', this.escape ? this.escapeCode(value) : value];
  };
}).apply(Escape.prototype);

module.exports = Escape;
