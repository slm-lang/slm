var Slm = require('./slm');

var blockRe = /^(case|default)\b/;
var wrapCondRe = /^(for|switch|catch|while|if|else\s+if)\s+(?!\()((\S|\s\S)*)\s*$/;
var ifRe = /^(if|switch|while|for|else|finally|catch)\b/;
var callbackRe = /(function\s*\([^\)]*\)\s*)[^\{]/;

function Brackets() {}

var p = Brackets.prototype = new Slm();

p.on_slm_control = function(exps) {
  var code = exps[2], content = exps[3], m;

  m = wrapCondRe.exec(code);
  if (m) {
    code = code.replace(m[2], '(' + m[2] + ')');
  }

  code = this._expandCallback(code, content);
  return ['slm', 'control', code, this.compile(content)];
};

p.on_slm_output = function(exps) {
  var code = exps[3], content = exps[4];
  code = this._expandCallback(code, content);
  return ['slm', 'output', exps[2], code, this.compile(content)];
};

p._expandCode = function(code, postCode) {
    var index, m = callbackRe.exec(code);
    if (m) {
      index = m.index + m[1].length;
      postCode += code.slice(index);
      code = code.slice(0, index);
    } else if ((index = code.lastIndexOf(')')) !== -1) {
      var firstIndex = code.indexOf('(');
      if (firstIndex === -1) {
        throw new Error('Missing open brace "(" in `' + code + '`');
      }
      var args = code.slice(firstIndex + 1, index);
      postCode += code.slice(index);
      code = code.slice(0, index);
      if (!/^\s*$/.test(args)) {
         code += ',';
      }
      code += 'function()';
    }

    return [code, postCode];
};

p._expandCallback = function(code, content) {
  if (blockRe.test(code) || this._isEmptyExp(content)) {
    return code;
  }

  var postCode = '}';

  if (!ifRe.test(code)) {
    var parts = this._expandCode(code, postCode);
    code = parts[0];
    postCode = parts[1];
  }
  code += '{';
  content.push(['code', postCode]);
  return code;
};

module.exports = Brackets;
