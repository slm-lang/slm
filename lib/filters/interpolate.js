var Slm = require('./slm');

var escapedInterpolationRe = /^\\\$\{/;
var interpolationRe = /^\$\{/;
var staticTextRe = /^([\$\\]?[^\$\\]*([\$\\][^\\\$\{][^\$\\]*)*)/;

function Interpolate() {}

var p = Interpolate.prototype = new Slm();

p.on_slm_interpolate = function(exps) {
  var str = exps[2], m, code;

  // Interpolate variables in text (${variable}).
  // Split the text into multiple dynamic and static parts.
  var block = ['multi'];
  do {
    // Escaped interpolation
    m = escapedInterpolationRe.exec(str);
    if (m) {
      block.push(['static', '${']);
      str = str.slice(m[0].length);
      continue;
    }
    m = interpolationRe.exec(str);
    if (m) {
      // Interpolation
      var res = this._parseExpression(str.slice(m[0].length));
      str = res[0];
      code = res[1];
      var escape = code[0] !== '=';
      block.push(['slm', 'output', escape, escape ? code : code.slice(1), ['multi']]);
    } else {
      m = staticTextRe.exec(str);
      // static text
      block.push(['static', m[0]]);
      str = str.slice(m[0].length);
    }
  } while (str.length);

  return block;
};

p._parseExpression = function(str) {
  for (var count = 1, i = 0, l = str.length; i < l && count; i++) {
    if (str[i] === '{') {
      count++;
    } else if (str[i] === '}') {
      count--;
    }
  }

  if (count) {
    throw new Error('Text interpolation: Expected closing }');
  }

  return [str.slice(i), str.substring(0, i - 1)];
};

module.exports = Interpolate;
