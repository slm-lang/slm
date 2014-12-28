var Template = require('./template');

var template = new Template(require('./runtime_node'));

exports.template = template;
exports.compile = template.compile;
