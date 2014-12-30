var Runtime = require('./runtime');

function BrowserCtx() {}

var CtxProto = BrowserCtx.prototype = new Runtime.Ctx();

CtxProto._loadWithCache = function(path) {
  var fn = BrowserCtx.cache[path];
  if (fn) {
    return fn;
  }

  var result = BrowserCtx.cache[path] = this._loadWithoutCache(path);
  return result;
};

CtxProto._loadWithoutCache = function(path) {
};

CtxProto._load = CtxProto._loadWithCache;

CtxProto._resolvePath = function(path) {
};

module.exports = Runtime;
module.exports.Ctx = BrowserCtx;
