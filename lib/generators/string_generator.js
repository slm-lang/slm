var Generator = require('../generator');

function StringGenerator(name, capture, initializer) {
  this.buffer = name || '_b';
  this.capture = capture;
  this.initializer = initializer;
}
var StringGeneratorProto = StringGenerator.prototype = new Generator;

StringGeneratorProto.preamble = function() {
  if (this.capture && this.initializer) {
    return this.initializer;
  }
  return "var " + this.buffer + "='';";
}

StringGeneratorProto.on_capture = function(exps) {
  var generator = new StringGenerator(exps[1], true, exps[2]);
  generator.dispatcher = this.dispatcher;
  return generator.exec(exps[3]);
}

module.exports = StringGenerator;
