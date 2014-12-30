var Slm = require('./slm');

function AttrMerge() {
  this._mergeAttrs = {'id': '-', 'class': ' '};
}

AttrMerge.prototype = new Slm();

AttrMerge.prototype.on_html_attrs = function(exps) {
  var names = [], values = {};
  for (var i = 2, l = exps.length; i < l; i++) {
    var attr = exps[i];
    var name = attr[2].toString(), value = attr[3];
    if (values[name]) {
      if (!this._mergeAttrs[name]) {
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
  for (var ni = 0, name; name = names[ni]; ni++) {
    var value = values[name], delimiter = this._mergeAttrs[name];
    if (delimiter && value.length > 1) {
      var all = false, exp = ['multi'];
      for (var k = 0, kv; kv = value[j]; j++) {
        all = this._isContainNonEmptyStatic(kv);
        if (!all) {
          break;
        }
      }
      if (all) {
        for (var j = 0, jv; jv = value[j]; j++) {
          if (j) {
            exp.push(['static', delimiter]);
          }
          exp.push(jv);
        }
        attrs[ni] = ['html', 'attr', name, exp];
      } else {
        var captures = this._uniqueName();
        exp.push(['code', 'var ' + captures + '=[];']);
        for (var j = 0, v; v = value[j]; j++) {
          exp.push(['capture', captures + '[' + j + ']', captures + '[' + j + ']' + '=\'\';', v]);
        }
        exp.push(['dynamic', 'rt.rejectEmpty(' + captures + ').join("' + delimiter + '")']);
        attrs[ni] = ['html', 'attr', name, exp];
      }
    } else {
      attrs[ni] = ['html', 'attr', name, value[0]];
    }
  }

  return ['html', 'attrs'].concat(attrs);
};

module.exports = AttrMerge;
