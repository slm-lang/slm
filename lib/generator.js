var Dispatcher = require('./dispatcher');

function Generator() {
  this.buffer = '_buf';
}
Generator.prototype = new Dispatcher();

(function() {

  this.exec = function(exp) {
    return [this.preamble(), this.compile(exp), this.postamble()].join('; ');
  };

  this.on = function(exp) {
    throw new Error('Generator supports only core expressions - found ' + exp.toString());
  };

  this.on_multi = function(exps) {
    var len = exps.length;
    var res = [];
    for (var i = 1; i < len; i++) {
      res[i] = this.compile(exps[i]);
    }
    return res.join('; ');
  };

  this.on_newline = function() {
    return "\n"
  };

  this.on_capture = function(name, exp) {
    // return this.captureGenerator.new(:buffer => name).call(exp)
  };

  this.on_static = function(exps) {
    var text = exps[1];
    return this.concat(JSON.stringify(text));
  };

  this.on_dynamic = function(exps) {
    var code = exps[1];
    return this.concat(code);
  };

  this.on_code = function(exps) {
    var code = exps[1];
    return code;
  };

  this.concat = function(str) {
    return this.buffer + '+=(' + str +')';
  };


}).call(Generator.prototype);

module.exports = Generator;
