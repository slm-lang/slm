var Dispatcher = require('./dispatcher');

function Filter() {}
var FilterProto = Filter.prototype = new Dispatcher();

var _uniqueName = 0;

// Tools

FilterProto._isEmptyExp = function(exp) {
  switch (exp[0]) {
  case 'multi':
    for (var i = 1, l = exp.length; i < l; i++) {
      if (!this._isEmptyExp(exp[i])) {
        return false;
      }
    }
    return true;
  case 'newline':
    return true;
  default:
    return false;
  }
};

FilterProto._uniqueName = function() {
  _uniqueName++;
  return '$lm' + _uniqueName.toString(16);
};

// Core

FilterProto.on_multi = function(exps) {
  for (var i = 1, l = exps.length; i < l; i++) {
    exps[i] = this.compile(exps[i]);
  }
  return exps;
};

FilterProto.on_capture = function(exps) {
  return ['capture', exps[1], exps[2], this.compile(exps[3])];
};

// Control Flow

FilterProto._shiftAndCompile = function(exps) {
  for (var i = 2, l = exps.length; i < l; i++) {
    exps[i] = this.compile(exps[i]);
  }
  return exps;
};

FilterProto.on_if = FilterProto._shiftAndCompile;

FilterProto._shiftAndCompileMulti = function(exps) {
  var res = ['multi'];

  for (var i = 2, l = exps.length; i < l; i++) {
    res.push(this.compile(exps[i]));
  }
  return res;
};

FilterProto.on_switch = function(exps) {
  for (var i = 2, l = exps.length; i < l; i++) {
    var exp = exps[i];
    exps[i] = [exp[0], this.compile(exp[1])];
  }
  return exps;
};

FilterProto.on_block = function(exps) {
  return ['block', exps[1], this.compile(exps[2])];
};

// Escaping

FilterProto.on_escape = function(exps) {
  return ['escape', exps[1], this.compile(exps[2])];
};

module.exports = Filter;
