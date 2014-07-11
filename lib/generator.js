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

  this.on_multi = function(exp) {
    var len = exp.length;
    var res = [];
    for (var i = 0; i < len; i++) {
      res[i] = this.compile(exp[i]);
    }
    return res.join('; ');
  };

  this.on_newline = function() {
    return "\n"
  };

  this.on_capture = function(name, exp) {
    // return this.captureGenerator.new(:buffer => name).call(exp)
  };

  this.on_static = function(text) {
    return this.concat(JSON.stringify(text[0]));
  };

  this.on_dynamic = function(code) {
    return this.concat(code[0]);
  };

  this.on_code = function(code) {
    return code[0]
  };

  this.concat = function(str) {
    return this.buffer + '+=(' + str +')';
  };


}).call(Generator.prototype);

module.exports = Generator;
