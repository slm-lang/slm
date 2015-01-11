var Filter = require('../html/html');

function Slm() {}
var p = Slm.prototype = new Filter();

// Pass-through handlers
p.on_slm_text = function(exps) {
  exps[2] = this.compile(exps[2]);
  return exps;
};

//p.on_slm_embedded = function(exps) {
  //exps[3] = this.compile(exps[3]);
  //return exps;
//};

p.on_slm_control = function(exps) {
  exps[3] = this.compile(exps[3]);
  return exps;
};

p.on_slm_output = function(exps) {
  exps[4] = this.compile(exps[4]);
  return exps;
};

module.exports = Slm;
