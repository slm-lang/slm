var Slm = require('./slm');

function AttributeRemover() {
  this.removeEmptyAttrs = ['id', 'class'];
};

AttributeRemover.prototype = new Slm;

(function() {
  this.on_html_attrs = function(exps) {
    var len = exps.length;
    for (var i = 2; i < len; i++) {
      exps[i] = this.compile(exps[i]);
    }
    return exps;
  }

  this.on_html_attr = function(exps) {
    var name = exps[2], value = exps[3];
    if (this.removeEmptyAttrs.indexOf(name.toString()) === -1) {
      return Slm.prototype.on_html_attr.call(this, exps);
    }

    if (this.isEmptyExp(value)) {
      return value;
    } else if (this.isContainNonEmptyStatic(value)) {
      return ['html', 'attr', name, value];
    } else {
      var tmp = this.uniqueName();
      return [
        'multi',
          ['code', 'var ' + tmp],
          ['capture', tmp, this.compile(value)],
          ['if', tmp + '.length',
            ['html', 'attr', name, ['dynamic', tmp]]
          ]
      ];
    }
  }

}).call(AttributeRemover.prototype);

module.exports = AttributeRemover;
