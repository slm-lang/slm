var Ctx = require('./context');
var Path = require('path');
var FS = require('fs');

function NodeCtx() {};

var CtxProto = NodeCtx.prototype = new Ctx();

CtxProto._loadWithCache = function(path) {
  var fn = NodeCtx.cache[path];
  if (fn) {
    return fn;
  }

  var result = Ctx.cache[path] = this._loadWithoutCache(path);
  return result;
};

CtxProto._loadWithoutCache = function(path) {
  var src = FS.readFileSync(path, 'utf8');
  return this.template.exec(src, {}, this);
};

CtxProto._load = CtxProto._loadWithCache;

CtxProto._resolvePath = function(path) {
  var dirname  = Path.dirname,
      basename = Path.basename,
      join = Path.join;

  if (path[0] !== '/' && !this.filename) {
    throw new Error('the "filename" option is required to use with "relative" paths');
  }

  if (path[0] === '/' && !this.basePath) {
    throw new Error('the "basePath" option is required to use with "absolute" paths');
  }

  path = join(path[0] === '/' ? this.basePath : dirname(this.filename), path);

  if (basename(path).indexOf('.') === -1) {
    path += '.slm';
  }

  return path;
};

module.exports = NodeCtx;
