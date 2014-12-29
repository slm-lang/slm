var Template = require('./template');
var template = new Template(require('./runtime_browser'));

template.template = template;
module.exports = template;
