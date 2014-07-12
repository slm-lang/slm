var Filter = require('../html/html');

// Flattens nested multi expressions

function Slm() {};
Slm.prototype = new Filter;

(function() {
  // Pass-through handler
  this.on_slm_text = function(exps) {
    exps[2] = this.compile(exps[2]);
    return exps;
  };

  // Pass-through handler
  this.on_slm_embedded = function(exps) {
    exps[3] = this.compile(exps[3]);
    return exps;
  };

  // Pass-through handler
  this.on_slm_control = function(exps) {
    exps[3] = this.compile(exps[3]);
    return exps;
  };

  // Pass-through handler
  this.on_slm_output = function(exps) {
    exps[4] = this.compile(exps[4]);
    return exps;
  };
}).call(Slm.prototype);

module.exports = Slm;
