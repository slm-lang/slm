var Filter = require('../filter');

// Merges several statics into a single static.  Example:
//
//   ['multi',
//     ['static', "Hello "],
//     ['static', "World!"]]
//
// Compiles to:
//
//   ['static', "Hello World!"]
//
function StaticMerger() {};
StaticMerger.prototype = new Filter;

StaticMerger.prototype.on_multi = function(exps) {
  var result = ['multi'], node;

  var len = exps.length;

  for (var i = 0; i < len; i++) {
    var exp = exps[i];
    if (exp[0] === 'static') {
      if (node) {
        node[1] += exp[1];
      } else {
        node = ['static', exp[1]];
        result.push(node)
      }
    } else {
      result.push(this.compile(exp));
      if (exp[0] !== 'newline') {
        node = null;
      }
    }
  }

  return result.length == 2 ? result[1] : result;
};

module.exports = StaticMerger;
