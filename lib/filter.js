var Dispatcher = require('./dispatcher');

function Filter() {};
Filter.prototype = new Dispatcher;

(function() {
  // Tools

  this.compactAndMap = function(items, callback) {
    var res = [], len = items.length;
    for (var i = 0; i < len; i++) {
      var item = items[i];

      if (item != null) {
        res.push(callback(item));
      }
    }
    return res;
  };

  this.isEmptyExp = function(exp) {
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
  };

  // Core

  this.on_multi = function(exps) {
    var len = exps.length;
    for (var i = 1; i < len; i++) {
      exps[i] = this.compile(exps[i]);
    }
    return exps;
  };

  this.on_capture = function(exps) {
    var name = exps[1], exp = exps[2];
    return ['capture', name, this.compile(exp)];
  };

  // Control Flow

  this.on_if = function(exps) {
    var condition = exps[1], cases = exps[2], self = this;
    return ['if', condition].concat(
      self.compactAndMap(cases, function(e) {
        return self.compile(e);
      })
    );
  };

  this.on_case = function(exps) {
    var args = exps[1], cases = exps[2], self = this;
    return ['case', arg].concat(
      self.compactAndMap(cases, function(condition, exp){
        return [condition, self.compile(exp)];
      })
    );
  };

  this.on_block = function(exps) {
    var code = exps[1], content = exps[2];
    return ['block', code, this.compile(content)];
  };

  this.on_cond = function(exps) {
    var cases = exps[1], res = ['cond'];

    for (var i = 0, cse; cse = cases[i]; i++) {
      res.push([cse[0], this.compile(cse[1])]);
    }

    return res;
  };

  // Escaping

  this.on_escape = function(exps) {
    return ['escape', exps[1], this.compile(exps[2])];
  };

}).call(Filter.prototype)

module.exports = Filter;
