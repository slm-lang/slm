var Path = require('path');
var FS = require('fs');

function Ctx() {
  this.contents = {};
  this.res = '';
  this.stack = [];
  this.m = null;
  this.tempalte = null;
  this.basePath = null;
}

Ctx.cache = {};

var CtxProto = Ctx.prototype;

CtxProto.pop = function(sp) {
  var l = this.stack.length;
  while(sp < l--) {
    var path = this.resolvePath(this.stack.pop());
    var fn = this.load(path);
    this.filename = path;
    fn.call(this.m, this);
  }
  return this.res;
}

CtxProto.partial = function(path, model, cb) {
  if (cb) {
    this.res = cb.call(this.m, this);
  }

  path = this.resolvePath(path);

  var f = this.load(path), oldModel = this.m, oldFilename = this.filename;
  this.filename = path;
  var res = this.rt.safe(f.call(this.m = model, this));
  this.m = oldModel;
  this.filename = oldFilename;
  return res;
}

CtxProto.extend = function(path) {
  this.stack.push(path);
}

CtxProto.content = function() {
  switch(arguments.length) {
    case 0:
      return this.rt.safe(this.res);
    case 1:
      return this.contents[arguments[0]] || '';
    case 2:
      var name = arguments[0], cb = arguments[1];
      if (name) {
        // capturing block
        this.contents[name] = cb.call(this.m);
        return '';
      } else {
        return cb.call(this.m);
      }
  }
}

CtxProto.load = function(path) {
  var fn = Ctx.cache[path];
  if (fn) {
    return fn;
  }

  var src = FS.readFileSync(path, 'utf8');
  Ctx.cache[path] = fn = this.template.exec(src)
  return fn;
};

CtxProto.resolvePath = function(path) {
  var dirname = Path.dirname;
  var basename = Path.basename;
  var join = Path.join;

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
