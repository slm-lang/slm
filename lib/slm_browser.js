var Template = require('./template');
var template = new Template(require('./vm_browser'));

module.exports = template.exports();
