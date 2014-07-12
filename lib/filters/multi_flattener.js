var Filter = require('../filter');

// Flattens nested multi expressions

function MultiFlattener() {};
MultiFlattener.prototype = new Filter;

MultiFlattener.prototype.on_multi = function(exps) {
  var len = exps.length;
  // If the multi contains a single element, just return the element
  if (len == 2) {
    return this.compile(exps[1]);
  }

  var result = ['multi'];

  for (var i = 1; i < len; i++) {
    var exp = exps[i];
    exp = this.compile(exp);
    if (exp[0] === 'multi') {
      var res = exp.splice(1);
      result = result.concat(res);
    } else {
      result.push(exp);
    }
  }

  return result;
};

module.exports = MultiFlattener;
