var Slm = require('./slm');

function Control() {
  this._ifRe = /^(if)\b|{\s*$/;
}

var ControlProto = Control.prototype = new Slm;

ControlProto.on_slm_control = function(exps) {
  return ['multi', ['code', exps[2]], this.compile(exps[3])];
}

ControlProto.on_slm_output = function(exps) {
  var escape = exps[2], code = exps[3], content = exps[4];
  if (this._ifRe.test(code)) {
    var tmp = this._uniqueName();
    var tmp2 = this._uniqueName();
    content = this.compile(content);
    content.splice(content.length - 1, 0, ['code', 'return rt.safe(' + tmp2 + ');']);
    return ['multi',
      // Capture the result of the code in a variable. We can't do
      // `[:dynamic, code]` because it's probably not a complete
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
        ['capture', tmp2, "var " + tmp2 + "='';", content]],

       // Output the content.
      ['escape', 'escape', ['dynamic', tmp]]
    ];
  } else {
    return ['multi', ['escape', escape, ['dynamic', code]], content];
  }
}

ControlProto.on_slm_text = function(exps) {
  return this.compile(exps[2]);
}

module.exports = Control;
