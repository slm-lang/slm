var escapeRe = /[&<>"]/;
var ampRe = /&/g;
var ltRe = /</g;
var gtRe = />/g;
var quotRe = /"/g;

function safe(val) {
  if (!val || val.htmlSafe) {
    return val;
  }

  var res = new String(val);
  res.htmlSafe = true
  return res;
}

function escape(str) {
  if (typeof(str) !== 'string') {
    if (!str) {
      return '';
    }
    if (str.htmlSafe) {
      return str.toString();
    }
    str = str.toString();
  }

  if (escapeRe.test(str) ) {
    if( str.indexOf('&') != -1 ) str = str.replace(ampRe, '&amp;');
    if( str.indexOf('<') != -1 ) str = str.replace(ltRe, '&lt;');
    if( str.indexOf('>') != -1 ) str = str.replace(gtRe, '&gt;');
    if( str.indexOf('"') != -1 ) str = str.replace(quotRe, '&quot;');
  }

  return str;
}

function rejectEmpty(arr) {
  var res = [];

  for (var i = 0, l = arr.length; i < l; i++) {
    var el = arr[i];
    if (el != null && el.length) {
      res.push(el);
    }
  }

  return res;
}

function flatten(arr) {
  return arr.reduce(function (acc, val) {
    if (val == null) {
      return acc;
    } else {
      return acc.concat(val.constructor === Array ? flatten(val) : val.toString());
    }
  }, []);
}

function Ctx() {
  this.contents = {};
  this.res = '';
  this.stack = [];
  this.cache = {};
  this.m = null;
};

var CtxProto = Ctx.prototype;

CtxProto.include = function(path, model, cb) {
  if (cb) {
    this.res = cb.call(this.m, this);
  }
  var f = this.load(path), oldModel = this.m,
  res = safe(f.call(this.m = model, this));
  this.m = oldModel;
  return res;
}

CtxProto.pop = function(sp) {
  var l = this.stack.length;
  while(sp < l--) {
    this.load(this.stack.pop()).call(this.m, this);
  }
  return this.res;
}

CtxProto.extend = function(path) {
  this.stack.push(path);
}

CtxProto.content = function() {
  switch(arguments.length) {
    case 0:
      return safe(this.res);
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
  return this.cache[path];
}

module.exports = {
  safe: safe,
  escape: escape,
  rejectEmpty: rejectEmpty,
  flatten: flatten,
  Ctx: Ctx
}
