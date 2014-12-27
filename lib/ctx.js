var Path = require('path');
var FS = require('fs');

function Ctx() {
  this.reset();
  this.template = this.basePath = null;
}

Ctx.cache = {};

var CtxProto = Ctx.prototype;

/*
  Prepare ctx for next template rendering
*/
CtxProto.reset = function() {
  this._contents = {};
  this.res = '';
  this.stack = [];
  this.m = null;
};

/*
  Pop stack to sp
*/
CtxProto.pop = function(sp) {
  var l = this.stack.length;
  var filename = this.filename;
  while(sp < l--) {
    var path = this._resolvePath(this.stack.pop());
    var fn = this._load(path);
    this.filename = path;
    fn.call(this.m, this);
  }
  this.filename = filename;
  return this.res;
};

CtxProto.partial = function(path, model, cb) {
  if (cb) {
    this.res = cb.call(this.m, this);
  }

  path = this._resolvePath(path);

  var f = this._load(path), oldModel = this.m, filename = this.filename;
  this.filename = path;
  var res = this.rt.safe(f.call(this.m = model, this));
  this.m = oldModel;
  this.filename = filename;
  return res;
};

CtxProto.extend = function(path) {
  this.stack.push(path);
};

CtxProto.content = function() {
  switch(arguments.length) {
    case 0:
      return this.rt.safe(this.res);
    case 1:
      return this._contents[arguments[0]] || '';
    case 2:
      var name = arguments[0], cb = arguments[1];
      if (name) {
        // capturing block
        this._contents[name] = cb.call(this.m);
        return '';
      } else {
        return cb.call(this.m);
      }
  }
};

CtxProto._loadWithCache = function(path) {
  var fn = Ctx.cache[path];
  if (fn) {
    return fn;
  }

  return Ctx.cache[path] = this._loadWithoutCache(path);
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

  if (path[0] !== '/' && !this.filename)
    throw new Error('the "filename" option is required to use with "relative" paths');

  if (path[0] === '/' && !this.basePath)
    throw new Error('the "basePath" option is required to use with "absolute" paths');

  path = join(path[0] === '/' ? this.basePath : dirname(this.filename), path);

  if (basename(path).indexOf('.') === -1) {
    path += '.slm';
  }

  return path;
};

module.exports = Ctx;
