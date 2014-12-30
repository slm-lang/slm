var Template = require('./template');
var template = new Template(require('./vm_browser'));

template.template = template;
module.exports = template;
