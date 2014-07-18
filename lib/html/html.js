var Filter = require('../filter');

function Html() {}
var HtmlProto = Html.prototype = new Filter;

HtmlProto.on_html_attrs = function(exps) {
  var len = exps.length;
  for (var i = 2; i < len; i++) {
    exps[i] = this.compile(exps[i]);
  }
  return exps;
}

HtmlProto.on_html_attr = function(exps) {
  var name = exps[2], content = exps[3];
  return ['html', 'attr', name, this.compile(content)];
}

HtmlProto.on_html_comment = function(exps) {
  var content = exps[2];
  return ['html', 'comment', this.compile(content)];
}

HtmlProto.on_html_condcomment = function(exps) {
  var condition = exps[2], content = exps[3];
  return ['html', 'condcomment', condition, this.compile(content)];
}

HtmlProto.on_html_js = function(exps) {
  var content = exps[2];
  return ['html', 'js', this.compile(content)];
}

HtmlProto.on_html_tag = function(exps) {
  var name = exps[2], attrs = exps[3], content = exps[4];
  var res = ['html', 'tag', name, this.compile(attrs)];
  if (content) {
    res.push(this.compile(content));
  }
  return res;
}

HtmlProto.isContainNonEmptyStatic = function(exp) {
  switch (exp[0]) {
  case 'multi':
    var len = exp.length;
    for (var i = 1; i < len; i++) {
      if (this.isContainNonEmptyStatic(exp[i])) {
        return true;
      }
    }
    return false;
  case 'escape':
    return this.isContainNonEmptyStatic(exp[exp.length -1]);
  case 'static':
    return exp[1].length
  default:
    return false;
  }
}

module.exports = Html;
