var tools = {};

tools.compactAndMap = function(items, callback) {
  var res = [];
  var i = items.length;
  while (i--) {
    var item = items[i];

    if (item != null) {
      res.push(callback(item));
    }
  }
  return res;
};

var CoreDispatcher = {
  _on_multi: function(exps) {
    var multi = ['multi'];

    var i = exps.length;
    while (i--) {
      multi[i] = this.compile(exps[i]);
    }

    return multi;
  },

  _on_capture: function(name, exp) {
    return ['capture', name, this.compile(exp)];
  }
};

var EscapeDispatcher = {
  _on_escape: function(flag, exp) {
    returm ['escape', flag, this.compile(exp)];
  }
};

var ControlFlowDispatcher = {
  _on_if: function(condition, cases) {
    var self = this;
    return ['if', condition].concat(
      tools.compactAndMap(cases, function(e) {
        return self.compile(e);
      })
    );
  },

  _on_case: function(arg, cases) {
    var self = this;
    return ['case', arg].concat(
      tools.compactAndMap(cases, function(condition, exp){
        return [condition, self.compile(exp)];
      })
    );
  },

  _on_block: function(code, content) {
    return ['block', code, this.compile(content)];
  },

  _on_cond: function(cases) {
    var res = ['cond'];

    for (var i = 0, cse; cse = cases[i]; i++) {
      res.push([cse[0], this.compile(cse[1])]);
    }

    return res;
  }
};

var CompiledDispatcher = {
  exec: function(exp) {
    this.compile(exp);
  },

  compile: function(exp) {
    this.dispatcher(exp);
  }

  dispatcher: function(exp) {
    this.replaceDispatcher(exp);
  }

  replaceDispatcher: function(exp) {

  }
}

function Filter() {

}

// Pass-through handler
Filter.prototype._on_slm_text = function(content) {
  return ['slm', 'text', this.compile(content)];
};

// Pass-through handler
Filter.prototype._on_slm_embedded = function(type, content) {
  return ['slm', 'embedded', type, this.compile(content)];
};

// Pass-through handler
Filter.prototype._on_slm_control = function(code, content) {
  return ['slm', 'control', code, this.compile(content)];
};

// Pass-through handler
Filter.prototype._on_slm_outout = function(escape, code, content) {
  return ['slm', 'output', escape, code, this.compile(content)];
};
