function Filter() { }

// Tools

Filter.prototype.compactAndMap = function(items, callback) {
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

// Core

Filter.prototype.on_multi = function(exps) {
  var multi = ['multi'];

  var i = exps.length;
  while (i--) {
    multi.push(this.compile(exps[i]));
  }

  return multi;
};

Filter.prototype.on_capture = function(name, exp) {
  return ['capture', name, this.compile(exp)];
};

// Control Flow

Filter.prototype.on_if = function(condition, cases) {
  var self = this;
  return ['if', condition].concat(
    self.compactAndMap(cases, function(e) {
      return self.compile(e);
    })
  );
};

Filter.prototype.on_case = function(arg, cases) {
  var self = this;
  return ['case', arg].concat(
    self.compactAndMap(cases, function(condition, exp){
      return [condition, self.compile(exp)];
    })
  );
};

Filter.prototype.on_block = function(code, content) {
  return ['block', code, this.compile(content)];
};

Filter.prototype.on_cond = function(cases) {
  var res = ['cond'];

  for (var i = 0, cse; cse = cases[i]; i++) {
    res.push([cse[0], this.compile(cse[1])]);
  }

  return res;
};

// Escaping

Filter.prototype.on_escape = function(flag, exp) {
  return ['escape', flag, this.compile(exp)];
};

// Dispatching

Filter.prototype.exec = function(exp) {
  return this.compile(exp);
};

Filter.prototype.compile = function(exp) {
  return this.dispatcher(exp);
};

Filter.prototype.dispatcher = function(exp) {
  return this.replaceDispatcher(exp);
}

Filter.prototype.dispatchedMethods = function() {
  var methods = [];

  for (var k in this) {
    if (/^on(_[a-zA-Z0-9]+)*$/.test(k)) {
      methods.push(k);
    }
  }
  return methods;
}

Filter.prototype.replaceDispatcher = function(exp) {

  console.log(methods);
};

module.exports = Filter;
