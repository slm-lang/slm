var tools = {};

tools.compactAndMap = function(items, callback) {
  var res = [];
  var i = items.length;
  while (i--) {
    var item = items[i];

    if (item != null) {
      res.push(callback(item));
    }
  }
  return res;
};


function StringGenerator() {

}

StringGenerator.prototype.preamble = function() {
  return "var _buf='';";
};

StringGenerator.prototype.postamble = function() {
  return 'return _buf;';
};

StringGenerator.prototype.exec = function(exp) {
  return [this.preamble(), this.compile(exp), this.postamble(), ''].join('');
}

StringGenerator.prototype.compile = function(exp) {
  var first = exp[0];

  switch (first) {
    case 'multi':
      var exps = exp[1];
      var res = '';
      for (var i = 0, e; e = exps[i]; i++) {
        res += this.compile(e);
      }
      return res;
    case 'if':
      var self = this;
      var cases = exp.slice(1);
      return ['if', condition].concat(
        tools.compactAndMap(cases, function(e) {
          return self.compile(e);
        })
      );
    case 'escape':
      // escape, flag, ...
      return exp[1] ? JSON.stringify(this.compile(exp[3])) : exp[3];
    case 'code':
      return exp[1] + ';';
    case 'static':
      return '_buf+=' + JSON.stringify(exp[1]) + ';';
    case 'dynamic':
      return '_buf+=' + exp[1] + ';';
    case 'newline':
      return "\n";
    default:
      throw Error('Unexpected expression: ' + first);
  }
}

exports.Generator = StringGenerator;
