var Slm = require('./slm');

function Brackets() {
  this.blockRe = /(^(case|default)\b)/;
  // this.ifRe = /^(for|if|while|else|else\s+if|try|catch|finally)\b/
  // this.elseRe = /^(else|else\s+if|catch|finally)\s/
  this.wrapCondRe = /^(for|switch|while|if|else\s+if)\s+(?!\()((\S|\s\S)*)\s*$/
}

var BracketsProto = Brackets.prototype = new Slm;

// BracketsProto.on_multi = function(exps) {
//   var res = ['multi'];
//   // This variable is true if the previous line was
//   // (1) a control code and (2) contained indented content.
//   var prevIndent = false;
//
//   for (var i = 1, l = exps.length; i < l; i++) {
//     var exp = exps[i];
//
//     if (exp[0] === 'slm' && exp[1] === 'control') {
//       // Two control code in a row. If this one is *not*
//       // an else block, we should close the previous one.
//       if (prevIndent && !this.elseRe.test(exp[2]) && !this.blockRe.test(exp[2])) {
//         // res.push(['code', '}']);
//       }
//
//       prevIndent = this.ifRe.test(exp[2]);
//       if (this.elseRe.test(exp[2])) {
//         // exp[2] = '} ' + exp[2];
//       }
//     } else if (exp[0] !== 'newline' && prevIndent) {
//       prevIndent = false;
//     }
//     res.push(this.compile(exp));
//   }
//
//   if (prevIndent) {
//     // res.push(['code', '}']);
//   }
//
//   return res;
// }

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
