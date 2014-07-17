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

  this.on_if = function(exps) {
    var condition = exps[1], yes = exps[2], no = exps[3];

    var result = ['multi', ['code', "if (" + condition + ") {"], this.compile(yes)]
    while (no && no[0] === 'if') {
      result.push(['code', "} else if (" + no[1] + ") {"]);
      result.push(this.compile(no[2]));
      no = no[3];
    }
    if (no) {
      result.push(['code', '} else {']);
      result.push(this.compile(no));
    }
    result.push(['code', '}']);
    return result;
  }

}).call(ControlFlow.prototype);

module.exports = ControlFlow;
