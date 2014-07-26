var Path = require('path');

function Ctx() {
  this.contents = {};
  this.res = '';
  this.stack = [];
  this.m = null;
  this.tempalte = null;
}

Ctx.cache = {};

var CtxProto = Ctx.prototype;

CtxProto.pop = function(sp) {
  var l = this.stack.length;
  while(sp < l--) {
    this.load(this.stack.pop()).call(this.m, this);
  }
  return this.res;
}

CtxProto.partial = function(path, model, cb) {
  if (cb) {
    this.res = cb.call(this.m, this);
  }
  var f = this.load(path), oldModel = this.m,
  res = this.rt.safe(f.call(this.m = model, this));
  this.m = oldModel;
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

  var src = fn.readFileSync(path, 'utf8');
  Ctx.cache[path] = fn = tempalte.exec(src)
  return fn;
}

module.exports = Ctx;
