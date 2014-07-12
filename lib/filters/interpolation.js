var Slm = require('./slm');

function Interpolation() {
  this.escapedInterpolationRegex = /^\\\$\{/;
  this.interpolationRegex = /^\$\{/;
  this.staticTextRegex = /^([\$\\]|[^\$\\]*)/;
};
Interpolation.prototype = new Slm;

(function() {
  this.on_slm_interpolate = function(exps) {
    var str = exps[2];
    var m, code;
    // Interpolate variables in text (#{variable}).
    // Split the text into multiple dynamic and static parts.
    var block = ['multi'];
    do {
      // Escaped interpolation
      if (m = this.escapedInterpolationRegex.exec(str)) {
        block.push(['static', '${']);
        str = str.slice(m[0].length);
      } else if (m = this.interpolationRegex.exec(str)) {
        // Interpolation
        var res = this.parseExpression(str.slice(m[0].length));
        str = res[0], code = res[1];
        var escape = code[0] !== '=';
        block.push(['slm', 'output', escape, escape ? code : code.slice(1), ['multi']]);
      } else if (m = this.staticTextRegex.exec(str)) {
        // Interpolation
        block.push(['static', m[0]]);
        str = str.slice(m[0].length);
      }
    } while (str.length);

    return block;
  };

  this.parseExpression = function(str) {
    var count = 1, i = 0, len = str.length;
    while (i < len && count != 0) {
      if (str[i] == '{') {
        count ++;
      } else if (str[i] == '}') {
        count --;
      }
      i++;
    }

    if (count != 0) {
      throw new Error('Text interpolation: Expected closing }');
    }

    var code = str.substring(0, i - 1);
    return [str.slice(i), code];
  };
}).call(Interpolation.prototype);

module.exports = Interpolation;
