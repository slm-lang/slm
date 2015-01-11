var Slm = require('./slm');

function AttrMerge(mergeAttrs) {
  this._mergeAttrs = mergeAttrs;
}

var p = AttrMerge.prototype = new Slm();

p.on_html_attrs = function(exps) {
  var names = [], values = {};
  for (var i = 2, l = exps.length; i < l; i++) {
    var attr = exps[i];
    var name = attr[2].toString(), val = attr[3];
    if (values[name]) {
      if (!this._mergeAttrs[name]) {
        throw new Error('Multiple ' + name + ' attributes specified');
      }

      values[name].push(val);
    } else {
      values[name] = [val];
      names.push(name);
    }
  }

  names.sort();

  return this._merge(names, values);
};

p._merge = function(names, values) {
  var attrs = [];
  for (var i = 0, il = names.length; i < il; i++) {
    var name = names[i];
    var value = values[name], delimiter = this._mergeAttrs[name];
    if (delimiter && value.length > 1) {
      var all = false, exp = ['multi'];
      for (var k = 0, kl = value.length; k < kl; k++) {
        var kv = value[k];
        all = this._isContainNonEmptyStatic(kv);
        if (!all) {
          break;
        }
      }
      if (all) {
        for (var j = 0, jl = value.length; j < jl; j++) {
          var jv = value[j];
          if (j) {
            exp.push(['static', delimiter]);
          }
          exp.push(jv);
        }
        attrs[i] = ['html', 'attr', name, exp];
      } else {
        var captures = this._uniqueName();
        exp.push(['code', 'var ' + captures + '=[];']);
        for (var a = 0, al = value.length; a < al; a++) {
          exp.push(['capture', captures + '[' + a + ']', captures + '[' + a + ']' + '=\'\';', value[a]]);
        }
        exp.push(['dynamic', 'vm.rejectEmpty(' + captures + ').join("' + delimiter + '")']);
        attrs[i] = ['html', 'attr', name, exp];
      }
    } else {
      attrs[i] = ['html', 'attr', name, value[0]];
    }
  }

  return ['html', 'attrs'].concat(attrs);
};

module.exports = AttrMerge;
