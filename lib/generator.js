var Dispatcher = require('./dispatcher');

function Generator() {
  this.buffer = '_b';
}
Generator.prototype = new Dispatcher();

(function() {

  this.exec = function(exp) {
    return [this.preamble(), this.compile(exp), this.postamble()].join('\n');
  };

  this.on = function(exp) {
    throw new Error('Generator supports only core expressions - found ' + JSON.stringify(exp));
  };

  this.on_multi = function(exps) {
    var res = [], len = exps.length;
    for (var i = 1; i < len; i++) {
      res[i] = this.compile(exps[i]);
    }
    return res.join('\n');
  };

  this.on_newline = function() {
    return "\n"
  };

  this.on_capture = function(name, exp) {
    // return this.captureGenerator.new(:buffer => name).call(exp)
  };

  this.on_static = function(exps) {
    return this.concat(JSON.stringify(exps[1]));
  };

  this.on_dynamic = function(exps) {
    return this.concat(exps[1]);
  };

  this.on_code = function(exps) {
    return exps[1];
  };

  this.concat = function(str) {
    return this.buffer + '+=' + str + ';';
  };


}).call(Generator.prototype);

module.exports = Generator;
