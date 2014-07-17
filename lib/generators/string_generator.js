var Generator = require('../generator');

function StringGenerator(name, capture) {
  this.buffer = name || '_b';
  this.capture = capture;
};
StringGenerator.prototype = new Generator;

(function() {
  this.preamble = function() {
    if (this.capture) {
      return this.buffer + "='';";
    }
    return "var " + this.buffer + "='';";
  };

  this.postamble = function() {
    if (this.capture) {
      return '';
    }
    return 'return ' + this.buffer + ';';
  };

  this.on_capture = function(exps) {
    var name = exps[1];
    var exp = exps[2];
    var generator = new StringGenerator(name, true);
    generator.dispatcher = this.dispatcher;
    return generator.exec(exp);
  };

}).call(StringGenerator.prototype);

module.exports = StringGenerator;
