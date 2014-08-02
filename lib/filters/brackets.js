var Slm = require('./slm');

function Brackets() {
  this._blockRe = /^(case|default)\b/;
  this._wrapCondRe = /^(for|switch|catch|while|if|else\s+if)\s+(?!\()((\S|\s\S)*)\s*$/
  this._ifRe = /^(if|switch|while|for|else|finally|catch)\b/
  this._callbackRe = /(function\s*\([^\)]*\)\s*)[^\{]/;
}

var BracketsProto = Brackets.prototype = new Slm;

BracketsProto.on_slm_control = function(exps) {
  var code = exps[2], content = exps[3], m;

  if (m = this._wrapCondRe.exec(code)) {
    code = code.replace(m[2], '(' + m[2] + ')');
  }

  code = this._expandCallback(code, content);
  return ['slm', 'control', code, this.compile(content)]
}

BracketsProto.on_slm_output = function(exps) {
  var code = exps[3], content = exps[4], postCode = '}', m;
  code = this._expandCallback(code, content);
  return ['slm', 'output', exps[2], code, this.compile(content)];
}

BracketsProto._expandCallback = function(code, content) {
  var postCode = '}', m, index;
  if (!this._blockRe.test(code) && !this._isEmptyExp(content)) {
    if (!this._ifRe.test(code)) {
      if (m = this._callbackRe.exec(code)) {
        index = m.index + m[1].length;
        postCode += code.slice(index);
        code = code.slice(0, index);
      } else if ((index = code.lastIndexOf(')')) !== -1) {
        var firstIndex = code.indexOf('(');
        if (firstIndex !== -1) {
          var args = code.slice(firstIndex + 1, index);
          postCode += code.slice(index);
          if (/^\s*$/.test(args)) {
            code = code.slice(0, index) + 'function()';
          } else {
            code = code.slice(0, index) + ',function()';
          }
        }
      }
    }
    code += '{';
    content.push(['code', postCode]);

  }
  return code;
}

module.exports = Brackets;
