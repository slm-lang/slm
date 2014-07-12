var Slm = require('./slm');

function Control() {
  this.ifRegex = /\A(if|unless)\b|do\s*(\|[^\|]*\|)?\s*$/
};

Control.prototype = new Slm;

(function() {

  this.on_slm_control = function(exps) {
    return ['multi', ['code', exps[2]], this.compile(exps[3])];
  };

  this.on_slm_output = function(exps) {
    // escape, code, content
    var escape = exps[2];
    var code = exps[3];
    var content = exps[4];

    if (this.ifRegex.test(code)) {
      var tmp = this.uniqueName();
      return ['multi',
        // Capture the result of the code in a variable. We can't do
        // `[:dynamic, code]` because it's probably not a complete
        // expression (which is a requirement for Temple).
        ['block', tmp + '=' + code,

          // Capture the content of a block in a separate buffer. This means
          // that `yield` will not output the content to the current buffer,
          // but rather return the output.
          //
          // The capturing can be disabled with the option :disable_capture.
          // Output code in the block writes directly to the output buffer then.
          // Rails handles this by replacing the output buffer for helpers.
          // options[:disable_capture] ? compile(content) : [:capture, unique_name, compile(content)]],
          ['capture', this.uniqueName(), this.compile(content)]],

         // Output the content.
         ['escape', 'escape', ['dynamic', tmp]]];
    } else {
      return ['multi', ['escape', escape, ['dynamic', code]], content];
    }
  };

  this.on_slm_text = function(exps) {
    return this.compile(exps[2]);
  };

}).call(Control.prototype);

module.exports = Control;
