var Slm = require('./slm');

function Splat() {};
Splat.prototype = new Slm;

(function() {
  this.on_html_tag = function(exps) {
    var name = exps[2];
    var attrs = exps[3]
    var content = exps[4];
    if (content && content[0] !== 'multi') {
      exps[4] = ['multi', this.compile(content)];
    }
    return exps;
  }
}).call(Splat.prototype);

module.exports = Splat;
