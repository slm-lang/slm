var Generator = require('../generator');

function StringGenerator() {};
StringGenerator.prototype = new Generator;

(function() {
  this.preamble = function() {
    return "var " + this.buffer + '=""';
  };

  this.postamble = function() {
    return 'return ' + this.buffer;
  };

}).call(StringGenerator.prototype);

module.exports = StringGenerator;
