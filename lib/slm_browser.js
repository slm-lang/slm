var Template = require('./template');

var template = new Template(require('./runtime_browser'));

exports.template = template;
exports.compile = function(source, options) {
  return template.compile(source, options);
};
exports.eval = function(src, context) {
  return template.eval(src, context);
}
