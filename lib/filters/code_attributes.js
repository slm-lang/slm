var Slm = require('./slm');

function CodeAttributes(mergeAttrs) {
  //this._attr = null;
  this._mergeAttrs = mergeAttrs;
}

var p = CodeAttributes.prototype = new Slm();

p.on_html_attrs = p._shiftAndCompileMulti;

p.on_html_attr = function(exps) {
  var name = exps[2], value = exps[3];
  if (value[0] === 'slm' && value[1] === 'attrvalue' && !this._mergeAttrs[name]) {
    // We handle the attribute as a boolean attribute
    var escape = value[2], code = value[3];
    switch (code) {
    case 'true':
      return ['html', 'attr', name, ['multi']];
    case 'false':
    case 'null':
    case 'undefined':
      return ['multi'];
    default:
      var tmp = this._uniqueName();
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
    this._attr = name;
    return Slm.prototype.on_html_attr.call(this, exps);
  }
};

p.on_slm_attrvalue = function(exps) {
  var escape = exps[2], code = exps[3];
  // We perform attribute merging on Array values
  var delimiter = this._mergeAttrs[this._attr];
  if (delimiter) {
    var tmp = this._uniqueName();
    return ['multi',
     ['code', 'var ' + tmp + '=' + code + ';'],
     ['if', tmp + ' instanceof Array',
      ['multi',
        ['code',  tmp + '=vm.rejectEmpty(vm.flatten(' + tmp + '));'],
       ['escape', escape, ['dynamic', tmp + '.join("' + delimiter + '")']]],
      ['escape', escape, ['dynamic', tmp]]]];
  }
  return ['escape', escape, ['dynamic', code]];
};

module.exports = CodeAttributes;
