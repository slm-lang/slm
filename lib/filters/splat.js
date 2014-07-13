var Slm = require('./slm');

function Splat() {};
Splat.prototype = new Slm;

(function() {
  this.on_html_tag = function(exps) {
    var name = exps[2];
    var attrs = exps[3]
    var content = exps[4];
    if (content && content[0] != 'multi') {
      console.log(content[0]);
      exps[4] = ['multi', this.compile(content)];
      // console.log('-----------------');
      // console.log(JSON.stringify(exps));
    }
    return exps;
  }
}).call(Splat.prototype);

module.exports = Splat;
