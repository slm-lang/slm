var Generator = require('../generator');

function StringGenerator(name, initializer) {
  this._buffer = name || '_b';
  this._initializer = initializer;
}
var StringGeneratorProto = StringGenerator.prototype = new Generator();

StringGeneratorProto.preamble = function() {
  return this._initializer ? this._initializer : 'var ' + this._buffer + '=\'\';';
};

StringGeneratorProto.on_capture = function(exps) {
  var generator = new StringGenerator(exps[1], exps[2]);
  generator._dispatcher = this._dispatcher;
  return generator.exec(exps[3]);
};

module.exports = StringGenerator;
