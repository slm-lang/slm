var Slm = require('./slm');

function CodeAttributes() {
  this.attr = null;
  this.mergeAttrs = {'class':' '};
};

CodeAttributes.prototype = new Slm;

(function() {
  this.on_html_attrs = function(exps) {
    var res = ['multi'], len = exps.length;
    for (var i = 2; i < len; i++) {
      res.push(this.compile(exps[i]));
    }
    return res;
  }

  // Handle attribute expression `[:html, :attr, name, value]`
  //
  // @param [String] name Attribute name
  // @param [Array] value Value expression
  // @return [Array] Compiled temple expression
  this.on_html_attr = function(exps) {
    var name = exps[2], value = exps[3];
    if (value[0] === 'slm' && value[1] === 'attrvalue' && !this.mergeAttrs[name]) {
      // We handle the attribute as a boolean attribute
      var escape = value[2], code = value[3];
      switch(code) {
      case 'true':
        return ['html', 'attr', name, ['multi']];
      case 'false':
      case 'null':
        return ['multi'];
      default:
        var tmp = this.uniqueName();
        return ['multi',
         ['code', tmp + '=' + code],
         ['switch', tmp,
          ['true', ['multi',
            ['html', 'attr', name, ['multi']],
            ['code', 'break']]],
          ['false', ['multi']],
          ['null', ['code', 'break']],
          ['default', ['html', 'attr', name, ['escape', escape, ['dynamic', tmp]]]]]];
      }
    } else {
      // Attribute with merging
      this.attr = name;
      return Slm.prototype.on_html_attr.call(this, exps);
    }
  }

  // Handle attribute expression `[:slim, :attrvalue, escape, code]`
  //
  // @param [Boolean] escape Escape html
  // @param [String] code Ruby code
  // @return [Array] Compiled temple expression
  this.on_slim_attrvalue = function(escape, code) {
    // We perform attribute merging on Array values
    var delimiter = this.mergeAttrs[this.attr]
    if (delimiter) {
      var tmp = this.uniqueName();
      return ['multi',
       ['code', tmp + '=' + code],
       ['if', 'tmp instanceof Array',
        ['multi',
        //  ['code', "#{tmp}.flatten!"],
        //  ['code', "#{tmp}.map!(&:to_s)"],
        //  ['code', "#{tmp}.reject!(&:empty?)"],
         ['escape', escape, ['dynamic', tmp + '.join("'+ delimiter +'")']]],
        ['escape', escape, ['dynamic', tmp]]]]
    } else {
      return ['escape', escape, ['dynamic', code]];
    }
  }

}).call(CodeAttributes.prototype);

module.exports = CodeAttributes;
