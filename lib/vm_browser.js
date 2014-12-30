var VM = require('./vm');

function VMBrowser() {}

var VMProto = VMBrowser.prototype = new VM();

VMProto._loadWithCache = function(path) {
  var fn = VMBrowser.cache[path];
  if (fn) {
    return fn;
  }

  var result = VMBrowser.cache[path] = this._loadWithoutCache(path);
  return result;
};

VMProto._loadWithoutCache = function(path) {
};

VMProto._load = CtxProto._loadWithCache;

VMProto._resolvePath = function(path) {
};

module.exports = VMBrowser;
