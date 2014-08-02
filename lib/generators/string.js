var Generator = require('../generator');

function StringGenerator(name, capture, initializer) {
  this._buffer = name || '_b';
  this._capture = capture;
  this._initializer = initializer;
}
var StringGeneratorProto = StringGenerator.prototype = new Generator;

StringGeneratorProto.preamble = function() {
  if (this._capture && this._initializer) {
    return this._initializer;
  }
  return "var " + this._buffer + "='';";
}

StringGeneratorProto.on_capture = function(exps) {
  var generator = new StringGenerator(exps[1], true, exps[2]);
  generator._dispatcher = this._dispatcher;
  return generator.exec(exps[3]);
}

module.exports = StringGenerator;
