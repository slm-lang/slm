var Template = require('./template');

var template = new Template(require('./runtime_node'));

template.template = template;
module.exports = template;
