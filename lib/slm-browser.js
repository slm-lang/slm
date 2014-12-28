var Template = require('./template');

var template = new Template(require('./context-browser'));

exports.template = template;

exports.compile = function(src, options) {
  return template.compile(src, options);
};
