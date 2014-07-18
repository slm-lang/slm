var Dispatcher = require('./dispatcher');

function Filter() {};
var FilterProto = Filter.prototype = new Dispatcher;

var _uniqueName = 0;

// Tools

FilterProto.isEmptyExp = function(exp) {
  switch (exp[0]) {
  case 'multi':
    for (var i = 1, l = exp.length; i < l; i++) {
      if (!this.isEmptyExp(exp[i])) {
        return false;
      }
    }
    return true;
  case 'newline':
    return true;
  default:
    return false;
  }
}

FilterProto.uniqueName = function() {
  var prefix = '$lm';
  return prefix + _uniqueName++;
}

// Core

FilterProto.on_multi = function(exps) {
  for (var i = 1, l = exps.length; i < l; i++) {
    exps[i] = this.compile(exps[i]);
  }
  return exps;
}

FilterProto.on_capture = function(exps) {
  return ['capture', exps[1], this.compile(exps[2])];
}

// Control Flow

FilterProto.on_if = function(exps) {
  for (var i = 2, l = exps.length; i < l; i++) {
    exps[i] = this.compile(exps[i]);
  }
  return exps;
}

FilterProto.on_switch = function(exps) {
  for (var i = 2, l = exps.length; i < l; i++) {
    var exp = exps[i];
    exps[i] = [exp[0], this.compile(exp[1])];
  }
  return exps;
}

FilterProto.on_block = function(exps) {
  return ['block', exps[1], this.compile(exps[2])];
}

// Escaping

FilterProto.on_escape = function(exps) {
  return ['escape', exps[1], this.compile(exps[2])];
};

module.exports = Filter;
