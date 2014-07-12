function Html() {
};

var Filter = require('../filter');
Html.prototype = new Filter;

(function() {

  this.on_html_attrs = function(exps) {
    var res = ['html', 'attrs'];
    var attrs = exps[2];
    var len = attrs.length;
    for (var i = 0; i < len; i++) {
      res.push(this.compile(attrs[i]));
    }
    return res;
  };

  this.on_html_attr = function(exps) {
    var name = exps[2];
    var content = exps[3];
    return ['html', 'attr', name, this.compile(content)];
  };

  this.on_html_comment = function(exps) {
    var content = exps[2];
    return ['html', 'comment', this.compile(content)];
  };

  this.on_html_condcomment = function(exps) {
    var condition = exps[2];
    var content = exps[3];
    return ['html', 'condcomment', condition, this.compile(content)];
  };

  this.on_html_js = function(exps) {
    var content = exps[2];
    return ['html', 'js', this.compile(content)];
  };

  this.on_html_tag = function(exps) {
    var name = exps[2];
    var attrs = exps[3];
    var content = exps[4];
    var res = ['html', 'tag', name, this.compile(attrs)];
    if (content) {
      res.push(this.compile(content));
    }
    return result;
  };

  this.isContainNonemptyStatic = function(exp) {
    switch (exp[0]) {
    case 'multi':
      var len = exp.length;
      for (var i = 1; i < len; i++) {
        if (this.isContainNonemptyStatic(exp[i])) {
          return true;
        }
      }
      return false;
    case 'escape':
      return this.isContainNonemptyStatic(exp[exp.length -1]);
    case 'static':
      return exp[1].length === 0
    default:
      return false;
    }
  }
}).call(Html.prototype);

module.exports = Html;
