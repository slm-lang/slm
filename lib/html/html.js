function Html() {
};

var Filter = require('../filter');
Html.prototype = new Filter;

(function() {

  this.on_html_attrs = function(attrs) {
    var res = ['html', 'attrs'];
    var len = attrs.length;
    for (var i = 0; i < len; i++) {
      res.push(this.compile(attrs[i]));
    }
    return res;
  };

  this.on_html_attr = function(name, content) {
    return ['html', 'attr', name, this.compile(content)];
  };

  this.on_html_comment = function(content) {
    return ['html', 'comment', this.compile(content)];
  };

  this.on_html_condcomment = function(condition, content) {
    return ['html', 'condcomment', condition, this.compile(content)];
  };

  this.on_html_js = function(content) {
    return ['html', 'js', this.compile(content)];
  };

  this.on_html_tag = function(name, attrs, content) {
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
}).apply(Html.prototype);

module.exports = Html;
