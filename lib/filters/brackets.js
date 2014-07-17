var Slm = require('./slm');

function Brackets() {
  this.ifRe = /^(for|if|unless|else|elsif|when|rescue|ensure|while)\b|do\s*(\|[^\|]*\|)?\s*$/
  this.blockRe = /(^(if|unless|else|elsif|when|begin|rescue|ensure|case)\b)|do\s*(\|[^\|]*\|\s*)?$/;
  this.elseRe = /^(else|else\s+if|when|rescue|ensure)\s/
  this.wrapCondRe = /^(for|while|if|}\s+else\s+if)\s+(?!\()((\S|\s\S)*)\s*$/
};

Brackets.prototype = new Slm;

(function() {

    this.on_multi = function(exps) {
      var res = ['multi'];
      // This variable is true if the previous line was
      // (1) a control code and (2) contained indented content.
      var prevIndent = false;

      var len = exps.length;
      for (var i = 1; i < len; i++) {
        var exp = exps[i];

        if (exp[0] === 'slm' && exp[1] === 'control') {
          // TODO: raise(Temple::FilterError, 'Explicit end statements are forbidden') if exp[2] =~ END_RE

          // Two control code in a row. If this one is *not*
          // an else block, we should close the previous one.
          if (prevIndent && !this.elseRe.test(exp[2])) {
            res.push(['code', '}']);
          }

          prevIndent = this.ifRe.test(exp[2]);
          if (this.elseRe.test(exp[2])) {
            exp[2] = '} ' + exp[2];
          }
        } else if (exp[0] !== 'newline' && prevIndent) {
          // res.push(['code', '}']);
          prevIndent = false;
        }
        res.push(this.compile(exp));
      }

      if (prevIndent) {
        res.push(['code', '}']);
      }

      return res;
    }

    // Handle control expression `[:slim, :control, code, content]`
    //
    // @param [String] code Ruby code
    // @param [Array] content Temple expression
    // @return [Array] Compiled temple expression
    this.on_slm_control = function(exps) {
      var code = exps[2], content = exps[3];

      var condBody = this.wrapCondRe.exec(code);
      if (condBody) {
        code = code.replace(condBody[2], '(' + condBody[2] + ')');
      }

      if (!this.isEmptyExp(content)) {
        code += ' {';
      }
      return ['slm', 'control', code, this.compile(content)]
    }

    // Handle output expression `[:slim, :output, escape, code, content]`
    //
    // @param [Boolean] escape Escape html
    // @param [String] code Ruby code
    // @param [Array] content Temple expression
    // @return [Array] Compiled temple expression
    this.on_slm_output = function(exps) {
      var code = exps[3], content = exps[4];
      if (!this.isEmptyExp(content)) {
        code += ' {';
      }
      return ['slm', 'output', exps[2], code, this.compile(content)];
    }

}).call(Brackets.prototype);

module.exports = Brackets;
