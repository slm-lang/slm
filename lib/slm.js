var Template = require('./template');

var template = new Template(require('./vm_node'));

template.template = template;
module.exports = template;
