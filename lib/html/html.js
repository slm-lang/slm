var Filter = require('../filter');

function Html() {}
var p = Html.prototype = new Filter();

p.on_html_attrs = p._shiftAndCompile;

p.on_html_attr = function(exps) {
  return ['html', 'attr', exps[2], this.compile(exps[3])];
};

p.on_html_comment = function(exps) {
  return ['html', 'comment', this.compile(exps[2])];
};

p.on_html_condcomment = function(exps) {
  return ['html', 'condcomment', exps[2], this.compile(exps[3])];
};

p.on_html_tag = function(exps) {
  var content = exps[4];
  var res = ['html', 'tag', exps[2], this.compile(exps[3])];
  if (content) {
    res.push(this.compile(content));
  }
  return res;
};

p._isContainNonEmptyStatic = function(exp) {
  switch (exp[0]) {
  case 'multi':
    for (var i = 1, l = exp.length; i < l; i++) {
      if (this._isContainNonEmptyStatic(exp[i])) {
        return true;
      }
    }
    return false;
  case 'escape':
    return this._isContainNonEmptyStatic(exp[exp.length - 1]);
  case 'static':
    return exp[1].length;
  default:
    return false;
  }
};

module.exports = Html;
