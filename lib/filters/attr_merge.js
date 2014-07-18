var Slm = require('./slm');

function AttrMerge() {
  this.mergeAttrs = {'id' : '_', 'class' : ' '};
}

AttrMerge.prototype = new Slm;

AttrMerge.prototype.on_html_attrs = function(exps) {
  var names = [], values = {};
  for (var i = 2, l = exps.length; i < l; i++) {
    var attr = exps[i];
    var name = attr[2].toString(), value = attr[3];
    if (values[name]) {
      if (!this.mergeAttrs[name]) {
        throw new Error('Multiple ' + name + ' attributes specified');
      }

      values[name].push(value);
    } else {
      values[name] = [value];
      names.push(name);
    }
  }

  names.sort();

  var attrs = [];
  for (var i = 0, name; name = names[i]; i++) {
    var value = values[name], delimiter;
    if ((delimiter = this.mergeAttrs[name]) && value.length > 1) {
      var exp = ['multi'];
      var all = false;
      for (var j = 0, v; v = value[j]; j++) {
        all = this.isContainNonEmptyStatic(v);
        if (!all) {
          break;
        }
      }
      if (all) {
        for (var j = 0, v; v = value[j]; j++) {
          if (j !== 0) {
            exp.push(['static', delimiter]);
          }
          exp.push(v);
        }
        attrs[i] = ['html', 'attr', name, exp];
      } else {
        var captures = this.uniqueName();
        exp.push(['code', 'var ' + captures + '=[];']);
        for (var j = 0, v; v = value[j]; j++) {
          exp.push(['capture', captures + '[' + j + ']', v]);
        }
        exp.push(['dynamic', 'slm.rejectEmpty('+captures +').join("' + delimiter + '")']);
        attrs[i] = ['html', 'attr', name, exp];
      }
    } else {
      attrs[i] = ['html', 'attr', name, value[0]];
    }
  }

  return ['html', 'attrs'].concat(attrs);
}

module.exports = AttrMerge;
