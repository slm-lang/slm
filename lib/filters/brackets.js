var Slm = require('./slm');

function Brackets() {
  this.blockRe = /^(case|default)\b/;
  this.wrapCondRe = /^(for|switch|catch|while|if|else\s+if)\s+(?!\()((\S|\s\S)*)\s*$/
}

var BracketsProto = Brackets.prototype = new Slm;

BracketsProto.on_slm_control = function(exps) {
  var code = exps[2], content = exps[3], m;

  if (m = this.wrapCondRe.exec(code)) {
    code = code.replace(m[2], '(' + m[2] + ')');
  }

  if (!this.isEmptyExp(content) && !this.blockRe.test(code)) {
    code += '{';
    content.push(['code', '}']);
  }
  return ['slm', 'control', code, this.compile(content)]
}

BracketsProto.on_slm_output = function(exps) {
  var code = exps[3], content = exps[4];
  if (!this.isEmptyExp(content) && !this.blockRe.test(code)) {
    code += '{';
    content.push(['code', '}']);
  }
  return ['slm', 'output', exps[2], code, this.compile(content)];
}

module.exports = Brackets;
