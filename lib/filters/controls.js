var Slm = require('./slm');

var ifRe = /^(if)\b|{\s*$/;

function Control() {}

var p = Control.prototype = new Slm();

p.on_slm_control = function(exps) {
  return ['multi', ['code', exps[2]], this.compile(exps[3])];
};

p.on_slm_output = function(exps) {
  var escape = exps[2], code = exps[3], content = exps[4];
  if (ifRe.test(code)) {
    var tmp = this._uniqueName(), tmp2 = this._uniqueName();
    content = this.compile(content);
    content.splice(content.length - 1, 0, ['code', 'return vm.safe(' + tmp2 + ');']);
    return ['multi',
      // Capture the result of the code in a variable. We can't do
      // `[dynamic, code]` because it's probably not a complete
      // expression (which is a requirement for Temple).
      ['block', 'var ' + tmp + '=' + code,

        // Capture the content of a block in a separate buffer. This means
        // that `yield` will not output the content to the current buffer,
        // but rather return the output.
        //
        // The capturing can be disabled with the option :disable_capture.
        // Output code in the block writes directly to the output buffer then.
        // Rails handles this by replacing the output buffer for helpers.
        // options[:disable_capture] ? compile(content) : [:capture, unique_name, compile(content)]],
        ['capture', tmp2, 'var ' + tmp2 + '=\'\';', content]],

       // Output the content.
      ['escape', 'escape', ['dynamic', tmp]]
    ];
  }
  return ['multi', ['escape', escape, ['dynamic', code]], content];
};

p.on_slm_text = function(exps) {
  return this.compile(exps[2]);
};

module.exports = Control;
