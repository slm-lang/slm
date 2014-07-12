var Filter = require('../filter');

function Interpolation() {};
Interpolation.prototype = new Filter;

(function() {
  this.on_slim_interpolate = function(str) {
    str = str[0]
    var m, code;
    // Interpolate variables in text (#{variable}).
    // Split the text into multiple dynamic and static parts.
    var block = ['multi'];
    do {
      // Escaped interpolation
      if (m = /^\\\$\{/.exec(str)) {
        block.push(['static', '${']);
        str = str.slice(m[0].length);
        continue;
      }

      if (m = /^\$\{/.exec(str)) {
        // Interpolation
        var res = this.parseExpression(str.slice(m[0].length));
        str = res[0], code = res[1];
        var escape = code[0] == '=';
        block.push(['slm', 'output', escape, escape ? code : code.slice(1), ['multi']]);
        continue;
      }

      if (m = /^([$\\]|[^#\\]*)/.exec(str)) {
        // Static text
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
