var Filter = require('../filter');

// Flattens nested multi expressions

function MultiFlattener() {}
MultiFlattener.prototype = new Filter();

MultiFlattener.prototype.on_multi = function(exps) {
  // If the multi contains a single element, just return the element
  var len = exps.length;
  if (len === 2) {
    return this.compile(exps[1]);
  }

  var res = ['multi'];

  for (var i = 1; i < len; i++) {
    var exp = exps[i];
    exp = this.compile(exp);
    if (exp[0] === 'multi') {
      for (var j = 1, l = exp.length; j < l; j++) {
        res.push(exp[j]);
      }
    } else {
      res.push(exp);
    }
  }

  return res;
};

module.exports = MultiFlattener;
