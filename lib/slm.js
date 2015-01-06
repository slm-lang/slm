var Template = require('./template');
var template = new Template(require('./vm_node'));

module.exports = template.exports();
