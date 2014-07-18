var Generator = require('../generator');

function StringGenerator(name, capture) {
  this.buffer = name || '_b';
  this.capture = capture;
}
var StringGeneratorProto = StringGenerator.prototype = new Generator;


StringGeneratorProto.preamble = function() {
  if (this.capture) {
    return this.buffer + "='';";
  }
  return "var " + this.buffer + "='';";
}

StringGeneratorProto.postamble = function() {
  if (this.capture) {
    return '';
  }
  return 'return ' + this.buffer + ';';
}

StringGeneratorProto.on_capture = function(exps) {
  var generator = new StringGenerator(exps[1], true);
  generator.dispatcher = this.dispatcher;
  return generator.exec(exps[2]);
}

module.exports = StringGenerator;
