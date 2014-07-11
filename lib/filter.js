var Dispatcher = require('./dispatcher');

function Filter() {};
Filter.prototype = new Dispatcher;

(function() {
  // Tools

  this.compactAndMap = function(items, callback) {
    var res = [];
    var i = items.length;
    while (i--) {
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
    var multi = ['multi'];


    var len = exps.length;
    for (var i = 0; i < len; i++) {
      multi.push(this.compile(exps[i]));
    }

    return multi;
  };

  this.on_capture = function(name, exp) {
    return ['capture', name, this.compile(exp)];
  };

  // Control Flow

  this.on_if = function(condition, cases) {
    var self = this;
    return ['if', condition].concat(
      self.compactAndMap(cases, function(e) {
        return self.compile(e);
      })
    );
  };

  this.on_case = function(arg, cases) {
    var self = this;
    return ['case', arg].concat(
      self.compactAndMap(cases, function(condition, exp){
        return [condition, self.compile(exp)];
      })
    );
  };

  this.on_block = function(code, content) {
    return ['block', code, this.compile(content)];
  };

  this.on_cond = function(cases) {
    var res = ['cond'];

    for (var i = 0, cse; cse = cases[i]; i++) {
      res.push([cse[0], this.compile(cse[1])]);
    }

    return res;
  };

  // Escaping

  this.on_escape = function(flag, exp) {
    return ['escape', flag, this.compile(exp)];
  };

}).call(Filter.prototype)

module.exports = Filter;
