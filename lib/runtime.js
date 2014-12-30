var ampRe = /&/g;
var escapeRe = /[&<>"]/;
var gtRe = />/g;
var ltRe = /</g;
var quotRe = /"/g;

function SafeStr(val) {
  this.htmlSafe = true;
  this._val = val;
}

SafeStr.prototype.toString = function() {
  return this._val;
};

function safe(val) {
  if (!val || val.htmlSafe) {
    return val;
  }

  return new SafeStr(val);
}

function escape(str) {
  if (typeof str !== 'string') {
    if (!str) {
      return '';
    }
    if (str.htmlSafe) {
      return str.toString();
    }
    str = str.toString();
  }

  if (escapeRe.test(str) ) {
    if (str.indexOf('&') !== -1) {
      str = str.replace(ampRe, '&amp;');
    }
    if (str.indexOf('<') !== -1) {
      str = str.replace(ltRe, '&lt;');
    }
    if (str.indexOf('>') !== -1) {
      str = str.replace(gtRe, '&gt;');
    }
    if (str.indexOf('"') !== -1) {
      str = str.replace(quotRe, '&quot;');
    }
  }

  return str;
}

function rejectEmpty(arr) {
  var res = [];

  for (var i = 0, l = arr.length; i < l; i++) {
    var el = arr[i];
    if (el !== null && el.length) {
      res.push(el);
    }
  }

  return res;
}

function flatten(arr) {
  return arr.reduce(function (acc, val) {
    if (val === null) {
      return acc;
    }
    return acc.concat(val.constructor === Array ? flatten(val) : val.toString());
  }, []);
}

function Ctx() {
  this.reset();
  this.template = this.basePath = null;
}

Ctx.cache = {};

var CtxProto = Ctx.prototype;

CtxProto.rebind = function() {
  this._content = this.content.bind(this);
  this._extend = this.extend.bind(this);
  this._partial = this.partial.bind(this);
};

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
    this.filename = this.stack.pop();
    this._load(this.filename).call(this.m, this);
  }
  this.filename = filename;
  return this.res;
};

CtxProto.extend = function(path) {
  this.stack.push(this._resolvePath(path));
};

CtxProto.partial = function(path, model, cb) {
  if (cb) {
    this.res = cb.call(this.m, this);
  }

  path = this._resolvePath(path);

  var f = this._load(path), oldModel = this.m, filename = this.filename;
  this.filename = path;
  var res = safe(f.call(this.m = model, this));
  this.m = oldModel;
  this.filename = filename;
  return res;
};

CtxProto.content = function() {
  switch (arguments.length) {
    case 0: // return main content
      return safe(this.res);
    case 1: // return named content
      return safe(this._contents[arguments[0]] || '');
    case 2: // capture named content
      var name = arguments[0], cb = arguments[1];
      if (name) {
        // capturing block
        this._contents[name] = cb.call(this.m);
        return '';
      }
      return cb.call(this.m);
    case 3: // content operations: default, append, prepend
      var name = arguments[0], mod = arguments[1], cb = arguments[2];
      var contents = this._contents[name] || '';
      switch (mod) {
        case 'default':
          return safe(contents || cb.call(this.m));
        case 'append':
          this._contents[name] = contents + cb.call(this.m);
          return '';
        case 'prepend':
          this._contents[name] = cb.call(this.m) + contents;
          return '';
      }
  }
};

module.exports = {
  Ctx: Ctx,
  escape: escape,
  flatten: flatten,
  rejectEmpty: rejectEmpty,
  safe: safe
};
