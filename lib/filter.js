var Dispatcher = require('./dispatcher');

function Filter() {};
var FilterProto = Filter.prototype = new Dispatcher;

var _uniqueName = 0;

// Tools

FilterProto.compactAndMap = function(items, callback) {
  var res = [], len = items.length;
  for (var i = 0; i < len; i++) {
    var item = items[i];

    if (item != null) {
      res.push(callback(item));
    }
  }
  return res;
}

FilterProto.isEmptyExp = function(exp) {
  switch (exp[0]) {
  case 'multi':
    var len = exp.length;
    for (var i = 1; i < len; i++) {
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
  var prefix = '$$slm_t';
  return prefix + _uniqueName++;
}

// Core

FilterProto.on_multi = function(exps) {
  var len = exps.length;
  for (var i = 1; i < len; i++) {
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
  var condition = exps[1], cases = exps[2], self = this;
  var res = ['if', exps[1]], len = exps.length;
  for (var i = 2; i < len; i++) {
    var exp = exps[i];
    if (exp) {
      res.push(this.compile(exp));
    }
  }
  return res;
}

FilterProto.on_switch = function(exps) {
  var len = exps.length;
  for (var i = 2; i < len; i++) {
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
