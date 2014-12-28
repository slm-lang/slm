var Template = require('./template');

var template = new Template(require('./runtime_browser'));

exports.template = template;
exports.compile = template.compile;
