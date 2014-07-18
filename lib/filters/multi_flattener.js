var Filter = require('../filter');

// Flattens nested multi expressions

function MultiFlattener() {}
MultiFlattener.prototype = new Filter;

MultiFlattener.prototype.on_multi = function(exps) {
  // If the multi contains a single element, just return the element
  var len = exps.length;
  if (len === 2) {
    return this.compile(exps[1]);
  }

  var result = ['multi'];

  for (var i = 1; i < len; i++) {
    var exp = exps[i];
    exp = this.compile(exp);
    if (exp[0] === 'multi') {
      var len2 = exp.length
      for (var j = 1; j < len2; j++) {
        result.push(exp[j]);
      }
    } else {
      result.push(exp);
    }
  }

  return result;
}

module.exports = MultiFlattener;
