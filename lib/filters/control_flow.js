var Slm = require('./slm');

function ControlFlow() {
};

ControlFlow.prototype = new Slm;

(function() {
  this.on_switch = function(exps) {
    var arg = exps[1],
        res = ['multi', ['code', "switch (" + arg + ") {"]],
        len = exps.length;
    for (var i = 2; i < len; i++) {
      var exp = exps[i];
      res.push(['code', exp[0] === 'default' ? 'default:' : 'case ' + exp[0] + ':']);
      res.push(this.compile(exp[1]));
    }

    res.push(['code', '}'])
    return res;
  }



}).call(ControlFlow.prototype);

module.exports = ControlFlow;
