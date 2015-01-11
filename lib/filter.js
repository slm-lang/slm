var Dispatcher = require('./dispatcher');

function Filter() {}
var p = Filter.prototype = new Dispatcher();

var uniqueName = 0;

// Tools

p._isEmptyExp = function(exp) {
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

p._uniqueName = function() {
  uniqueName++;
  return '$lm' + uniqueName.toString(16);
};

p._compileEach = function(exps, startIndex) {
  for (var i = startIndex, l = exps.length; i < l; i++) {
    exps[i] = this.compile(exps[i]);
  }
  return exps;
};

p._shiftAndCompile = function(exps) {
  return this._compileEach(exps, 2);
};

// Core

p.on_multi = function(exps) {
  return this._compileEach(exps, 1);
};

p.on_capture = function(exps) {
  return ['capture', exps[1], exps[2], this.compile(exps[3])];
};

// Control Flow

p.on_if = p._shiftAndCompile;

p._shiftAndCompileMulti = function(exps) {
  var res = ['multi'];

  for (var i = 2, l = exps.length; i < l; i++) {
    res.push(this.compile(exps[i]));
  }
  return res;
};

p.on_switch = function(exps) {
  for (var i = 2, l = exps.length; i < l; i++) {
    var exp = exps[i];
    exps[i] = [exp[0], this.compile(exp[1])];
  }
  return exps;
};

p.on_block = function(exps) {
  return ['block', exps[1], this.compile(exps[2])];
};

// Escaping

p.on_escape = function(exps) {
  return ['escape', exps[1], this.compile(exps[2])];
};

module.exports = Filter;
