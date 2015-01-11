var Slm = require('./slm');

function ControlFlow() {}

var p = ControlFlow.prototype = new Slm();

p.on_switch = function(exps) {
  var arg = exps[1], res = ['multi', ['code', 'switch(' + arg + '){']];

  for (var i = 2, l = exps.length; i < l; i++) {
    var exp = exps[i];
    res.push(['code', exp[0] === 'default' ? 'default:' : 'case ' + exp[0] + ':']);
    res.push(this.compile(exp[1]));
  }

  res.push(['code', '}']);
  return res;
};

p.on_if = function(exps) {
  var condition = exps[1], yes = exps[2], no = exps[3];

  var result = ['multi', ['code', 'if(' + condition + '){'], this.compile(yes)];
  if (no) {
    result.push(['code', '}else{']);
    result.push(this.compile(no));
  }
  result.push(['code', '}']);
  return result;
};

p.on_block = function(exps) {
  var code = exps[1], exp = exps[2];
  return ['multi', ['code', code], this.compile(exp)];
};

module.exports = ControlFlow;
