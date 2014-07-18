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
  var name = exps[1], exp = exps[2];
  return ['capture', name, this.compile(exp)];
}

// Control Flow

FilterProto.on_if = function(exps) {
  var res = ['if', exps[1]];
  for (var i = 2, l = exps.length; i < l; i++) {
    var exp = exps[i];
    if (exp) {
      res.push(this.compile(exp));
    }
  }
  return res;
}

FilterProto.on_switch = function(exps) {
  for (var i = 2, l = exps.length; i < l; i++) {
    var exp = exps[i];
    exps[i] = [exp[0], this.compile(exp[1])];
  }
  return exps;
}

FilterProto.on_block = function(exps) {
  var code = exps[1], content = exps[2];
  return ['block', code, this.compile(content)];
}

FilterProto.on_cond = function(exps) {
  var cases = exps[1], res = ['cond'];

  for (var i = 0, cse; cse = cases[i]; i++) {
    res.push([cse[0], this.compile(cse[1])]);
  }

  return res;
}

// Escaping

FilterProto.on_escape = function(exps) {
  return ['escape', exps[1], this.compile(exps[2])];
};

module.exports = Filter;
