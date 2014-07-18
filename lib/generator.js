var Dispatcher = require('./dispatcher');

function Generator() {
  this.buffer = '_b';
}

var GeneratorProto = Generator.prototype = new Dispatcher();

GeneratorProto.exec = function(exp) {
  return [this.preamble(), this.compile(exp), this.postamble()].join('\n');
}

GeneratorProto.on = function(exp) {
  throw new Error('Generator supports only core expressions - found ' + JSON.stringify(exp));
}

GeneratorProto.on_multi = function(exps) {
  var res = [], len = exps.length;
  for (var i = 1; i < len; i++) {
    res[i] = this.compile(exps[i]);
  }
  return res.join('\n');
}

GeneratorProto.on_newline = function() {
  return "\n"
}

GeneratorProto.on_static = function(exps) {
  return this.concat(JSON.stringify(exps[1]));
}

GeneratorProto.on_dynamic = function(exps) {
  return this.concat(exps[1]);
}

GeneratorProto.on_code = function(exps) {
  return exps[1];
}

GeneratorProto.concat = function(str) {
  return this.buffer + '+=' + str + ';';
}

module.exports = Generator;
