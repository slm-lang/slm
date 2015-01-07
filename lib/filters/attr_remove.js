var Slm = require('./slm');

function AttrRemove(removeEmptyAttrs) {
  this._removeEmptyAttrs = removeEmptyAttrs;
}

AttrRemove.prototype = new Slm();

AttrRemove.prototype.on_html_attr = function(exps) {
  var name = exps[2], value = exps[3];
  if (this._removeEmptyAttrs[name.toString()] === undefined) {
    return Slm.prototype.on_html_attr.call(this, exps);
  }

  if (this._isContainNonEmptyStatic(value)) {
    return ['html', 'attr', name, value];
  }

  var tmp = this._uniqueName();
  return [
    'multi',
      ['capture', tmp, 'var ' + tmp + '=\'\';', this.compile(value)],
      ['if', tmp + '.length',
        ['html', 'attr', name, ['dynamic', tmp]]
      ]
  ];
};

module.exports = AttrRemove;
