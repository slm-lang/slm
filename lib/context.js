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
  while (sp < l--) {
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


module.exports = Ctx;
