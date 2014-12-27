function Node() {
  this._method = null;
  this._nodes = {};
}

Node.prototype.compile = function(level, callMethod) {
  if (this._method) {
    callMethod = 'this.' + this._method + '(exps)';
  }

  var code = 'switch(exps[' + level + ']) {';
  var empty = true;

  for(var key in this._nodes) {
    empty = false;
    code += '\ncase \'' + key +'\':\n';
    code +=  this._nodes[key].compile(level + 1, callMethod) + ';';
  }

  if (empty) {
    return 'return ' + callMethod;
  }

  code += '\ndefault:\nreturn ' + (callMethod || 'exps') + ';}';

  return code;
};

function Dispatcher() {
  this._methodSplitRE = /_/;
  this._methodRE = /^on(_\w+)*$/;
}

var DispatcherProto = Dispatcher.prototype;

DispatcherProto.exec = function(exp) {
  return this.compile(exp);
};

DispatcherProto.compile = function(exp) {
  return this._dispatcher(exp);
};

DispatcherProto._dispatcher = function(exp) {
  return this._replaceDispatcher(exp);
};

DispatcherProto._dispatchedMethods = function() {
  var res = [];

  for (var key in this) {
    if (this._methodRE.test(key)) {
      res.push(key);
    }
  }
  return res;
};

DispatcherProto._replaceDispatcher = function(exp) {
  var tree = new Node();
  var dispatchedMethods = this._dispatchedMethods();
  for (var i = 0, method; method = dispatchedMethods[i]; i++) {
    var types = method.split(this._methodSplitRE), node = tree;
    for (var j = 1, type; type = types[j]; j++) {
      var n = node._nodes[type];
      node = node._nodes[type] = n || new Node();
    }
    node._method = method;
  }
  this._dispatcher = new Function('exps', tree.compile(0));
  return this._dispatcher(exp);
};

module.exports = Dispatcher;
