var Slm = require('./slm');

function CodeAttributes() {
  this.attr = null;
  this.mergeAttrs = {'class':' '};
}

var CodeAttributesProto = CodeAttributes.prototype = new Slm;

CodeAttributesProto.on_html_attrs = function(exps) {
  var res = ['multi'], len = exps.length;
  for (var i = 2; i < len; i++) {
    res.push(this.compile(exps[i]));
  }
  return res;
}

CodeAttributesProto.on_html_attr = function(exps) {
  var name = exps[2], value = exps[3];
  if (value[0] === 'slm' && value[1] === 'attrvalue' && !this.mergeAttrs[name]) {
    // We handle the attribute as a boolean attribute
    var escape = value[2], code = value[3];
    switch(code) {
    case 'true':
      return ['html', 'attr', name, ['multi']];
    case 'false':
    case 'null':
    case 'undefined':
      return ['multi'];
    default:
      var tmp = this.uniqueName();
      return ['multi',
       ['code', 'var ' + tmp + '=' + code],
       ['switch', tmp,
        ['true', ['multi',
          ['html', 'attr', name, ['multi']],
          ['code', 'break']]],
        ['false', ['multi']],
        ['undefined', ['multi']],
        ['null', ['code', 'break']],
        ['default', ['html', 'attr', name, ['escape', escape, ['dynamic', tmp]]]]]];
    }
  } else {
    // Attribute with merging
    this.attr = name;
    return Slm.prototype.on_html_attr.call(this, exps);
  }
}

CodeAttributesProto.on_slm_attrvalue = function(exps) {
  var escape = exps[2], code = exps[3];
  // We perform attribute merging on Array values
  var delimiter = this.mergeAttrs[this.attr]
  if (delimiter) {
    var tmp = this.uniqueName();
    return ['multi',
     ['code', 'var ' + tmp + '=' + code + ';'],
     ['if', tmp + ' instanceof Array',
      ['multi',
        ['code',  tmp + '=slm.rejectEmpty(slm.flatten(' + tmp + '));'],
       ['escape', escape, ['dynamic', tmp + '.join("'+ delimiter +'")']]],
      ['escape', escape, ['dynamic', tmp]]]]
  } else {
    return ['escape', escape, ['dynamic', code]];
  }
}

module.exports = CodeAttributes;
