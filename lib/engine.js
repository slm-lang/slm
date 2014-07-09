var Parser = require('./parser');

function Engine() {
  this.parser = new Parser();
  this.filters = [];
  this.generator = new StringGenerator();
}

Engine.prototype.exec = function(buffer) {
  var sexp = this.parser.exec(buffer);

  for (var i = 0, f; f = this.filters[i]; i++) {
    sexp = f.exec(sexp);
  }

  return this.generator.exec(sexp);
}
