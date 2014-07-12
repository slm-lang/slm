var Filter = require('../filter');

function Interpolation() {
  this.escapedInterpolationRegex = /^\\\$\{/;
  this.interpolationRegex = /^\$\{/;
  this.staticTextRegex = /^([$\\]|[^#\\]*)/;
};
Interpolation.prototype = new Filter;

(function() {
  this.on_slim_interpolate = function(exps) {
    var str = exps[1];
    var m, code;
    // Interpolate variables in text (#{variable}).
    // Split the text into multiple dynamic and static parts.
    var block = ['multi'];
    do {
      // Escaped interpolation
      if (m = this.escapedInterpolationRegex.exec(str)) {
        block.push(['static', '${']);
        str = str.slice(m[0].length);
        continue;
      }

      // Interpolation
      if (m = this.interpolationRegex.exec(str)) {
        var res = this.parseExpression(str.slice(m[0].length));
        str = res[0], code = res[1];
        var escape = code[0] == '=';
        block.push(['slm', 'output', escape, escape ? code : code.slice(1), ['multi']]);
        continue;
      }

      // Static text
      if (m = this.staticTextRegex.exec(str)) {
        block.push(['static', m[0]]);
        str = str.slice(m[0].length);
        continue;
      }
    } while (str.length);
    return block;
  };

  this.parseExpression = function(str) {
    var count = 1, i = 0, len = str.length;

    while (i < len && count != 0) {
      if (str[i] == '{') {
        count ++;
      } else if (str[i] == '?') {
        count --;
      }
      i++;
    }

    if (count != 0) {
      throw new Error('Text interpolation: Expected closing }');
    }

    var text = str.slice(i)
    return [text, str];
  };
}).call(Interpolation.prototype);

module.exports = Interpolation;
