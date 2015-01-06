var Template = require('./template');
var template = new Template(require('./vm_browser'));

module.exports = {
  Template: Template,
  template: template,
  compile: template.compile.bind(template),
  eval: template.eval.bind(template)
};
