(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Ctx = require('./context');

function BrowserCtx() {};

var CtxProto = BorwserCtx.prototype = new Ctx();

module.exports = BrowserCtx;


},{"./context":2}],2:[function(require,module,exports){
function Ctx() {
  this.reset();
  this.template = this.basePath = null;
}

Ctx.cache = {};

var CtxProto = Ctx.prototype;

/*
  Prepare ctx for next template rendering
*/
CtxProto.reset = function() {
  this._contents = {};
  this.res = '';
  this.stack = [];
  this.m = null;
};

/*
  Pop stack to sp
*/
CtxProto.pop = function(sp) {
  var l = this.stack.length;
  var filename = this.filename;
  while (sp < l--) {
    var path = this._resolvePath(this.stack.pop());
    var fn = this._load(path);
    this.filename = path;
    fn.call(this.m, this);
  }
  this.filename = filename;
  return this.res;
};

CtxProto.partial = function(path, model, cb) {
  if (cb) {
    this.res = cb.call(this.m, this);
  }

  path = this._resolvePath(path);

  var f = this._load(path), oldModel = this.m, filename = this.filename;
  this.filename = path;
  var res = this.rt.safe(f.call(this.m = model, this));
  this.m = oldModel;
  this.filename = filename;
  return res;
};

CtxProto.extend = function(path) {
  this.stack.push(path);
};

CtxProto.content = function() {
  switch(arguments.length) {
    case 0:
      return this.rt.safe(this.res);
    case 1:
      return this._contents[arguments[0]] || '';
    case 2:
      var name = arguments[0], cb = arguments[1];
      if (name) {
        // capturing block
        this._contents[name] = cb.call(this.m);
        return '';
      } else {
        return cb.call(this.m);
      }
  }
};


module.exports = Ctx;

},{}],3:[function(require,module,exports){
function Node() {
  this._method = null;
  this._nodes = {};
}

Node.prototype.compile = function(level, callMethod) {
  if (this._method) {
    callMethod = 'this.' + this._method + '(exps)';
  }

  var code = 'switch(exps[' + level + ']) {';
  var empty = true;

  for(var key in this._nodes) {
    empty = false;
    code += '\ncase \'' + key +'\':\n';
    code +=  this._nodes[key].compile(level + 1, callMethod) + ';';
  }

  if (empty) {
    return 'return ' + callMethod;
  }

  code += '\ndefault:\nreturn ' + (callMethod || 'exps') + ';}';

  return code;
};

function Dispatcher() {
  this._methodSplitRE = /_/;
  this._methodRE = /^on(_\w+)*$/;
}

var DispatcherProto = Dispatcher.prototype;

DispatcherProto.exec = function(exp) {
  return this.compile(exp);
};

DispatcherProto.compile = function(exp) {
  return this._dispatcher(exp);
};

DispatcherProto._dispatcher = function(exp) {
  return this._replaceDispatcher(exp);
};

DispatcherProto._dispatchedMethods = function() {
  var res = [];

  for (var key in this) {
    if (this._methodRE.test(key)) {
      res.push(key);
    }
  }
  return res;
};

DispatcherProto._replaceDispatcher = function(exp) {
  var tree = new Node();
  var dispatchedMethods = this._dispatchedMethods();
  for (var i = 0, method; method = dispatchedMethods[i]; i++) {
    var types = method.split(this._methodSplitRE), node = tree;
    for (var j = 1, type; type = types[j]; j++) {
      var n = node._nodes[type];
      node = node._nodes[type] = n || new Node();
    }
    node._method = method;
  }
  this._dispatcher = new Function('exps', tree.compile(0));
  return this._dispatcher(exp);
};

module.exports = Dispatcher;

},{}],4:[function(require,module,exports){
function Engine() {
  this._chain = [];
}

var EngineProto = Engine.prototype;

EngineProto.use = function(filter) {
  this._chain.push(filter);
};

EngineProto.exec = function(src, options) {
  var res = src;
  for (var i = 0, li = this._chain.length; i < li; i++) {
    res = this._chain[i].exec(res, options);
  }

  return res;
};

module.exports = Engine;

},{}],5:[function(require,module,exports){
var Template = require('./template');

var template = new Template(require('./context-browser'));

exports.template = template;

exports.compile = function(src, options) {
  return template.compile(src, options);
};

},{"./context-browser":1,"./template":25}],6:[function(require,module,exports){
var Dispatcher = require('./dispatcher');

function Filter() {}
var FilterProto = Filter.prototype = new Dispatcher();

var _uniqueName = 0;

// Tools

FilterProto._isEmptyExp = function(exp) {
  switch (exp[0]) {
  case 'multi':
    for (var i = 1, l = exp.length; i < l; i++) {
      if (!this._isEmptyExp(exp[i])) {
        return false;
      }
    }
    return true;
  case 'newline':
    return true;
  default:
    return false;
  }
};

FilterProto._uniqueName = function() {
  _uniqueName++;
  return '$lm' + _uniqueName.toString(16);
};

// Core

FilterProto.on_multi = function(exps) {
  var l = exps.length;
  for (var i = 1; i < l; i++) {
    exps[i] = this.compile(exps[i]);
  }
  return exps;
};

FilterProto.on_capture = function(exps) {
  return ['capture', exps[1], exps[2], this.compile(exps[3])];
};

// Control Flow

FilterProto._shiftAndCompile = function(exps) {
  for (var i = 2, l = exps.length; i < l; i++) {
    exps[i] = this.compile(exps[i]);
  }
  return exps;
};

FilterProto.on_if = FilterProto._shiftAndCompile;

FilterProto._shiftAndCompileMulti = function(exps) {
  var res = ['multi'];

  for (var i = 2, l = exps.length; i < l; i++) {
    res.push(this.compile(exps[i]));
  }
  return res;
};

FilterProto.on_switch = function(exps) {
  for (var i = 2, l = exps.length; i < l; i++) {
    var exp = exps[i];
    exps[i] = [exp[0], this.compile(exp[1])];
  }
  return exps;
};

FilterProto.on_block = function(exps) {
  return ['block', exps[1], this.compile(exps[2])];
};

// Escaping

FilterProto.on_escape = function(exps) {
  return ['escape', exps[1], this.compile(exps[2])];
};

module.exports = Filter;

},{"./dispatcher":3}],7:[function(require,module,exports){
var Slm = require('./slm');

function AttrMerge() {
  this._mergeAttrs = {'id' : '-', 'class' : ' '};
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
    var value = values[name], delimiter;
    if ((delimiter = this._mergeAttrs[name]) && value.length > 1) {
      var exp = ['multi'], all = false;
      for (var j = 0, v; v = value[j]; j++) {
        all = this._isContainNonEmptyStatic(v);
        if (!all) {
          break;
        }
      }
      if (all) {
        for (var j = 0, v; v = value[j]; j++) {
          if (j) {
            exp.push(['static', delimiter]);
          }
          exp.push(v);
        }
        attrs[ni] = ['html', 'attr', name, exp];
      } else {
        var captures = this._uniqueName();
        exp.push(['code', 'var ' + captures + '=[];']);
        for (var j = 0, v; v = value[j]; j++) {
          exp.push(['capture', captures + '[' + j + ']', captures + '[' + j + ']' + '=\'\';', v]);
        }
        exp.push(['dynamic', 'rt.rejectEmpty(' + captures +').join("' + delimiter + '")']);
        attrs[ni] = ['html', 'attr', name, exp];
      }
    } else {
      attrs[ni] = ['html', 'attr', name, value[0]];
    }
  }

  return ['html', 'attrs'].concat(attrs);
};

module.exports = AttrMerge;

},{"./slm":17}],8:[function(require,module,exports){
var Slm = require('./slm');

function AttrRemove() {
  this._removeEmptyAttrs = ['id', 'class'];
}

AttrRemove.prototype = new Slm();

AttrRemove.prototype.on_html_attr = function(exps) {
  var name = exps[2], value = exps[3];
  if (this._removeEmptyAttrs.indexOf(name.toString()) === -1) {
    return Slm.prototype.on_html_attr.call(this, exps);
  }

  if (this._isEmptyExp(value)) {
    return value;
  } else if (this._isContainNonEmptyStatic(value)) {
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

},{"./slm":17}],9:[function(require,module,exports){
var Slm = require('./slm');

function Brackets() {
  this._blockRe = /^(case|default)\b/;
  this._wrapCondRe = /^(for|switch|catch|while|if|else\s+if)\s+(?!\()((\S|\s\S)*)\s*$/;
  this._ifRe = /^(if|switch|while|for|else|finally|catch)\b/;
  this._callbackRe = /(function\s*\([^\)]*\)\s*)[^\{]/;
}

var BracketsProto = Brackets.prototype = new Slm();

BracketsProto.on_slm_control = function(exps) {
  var code = exps[2], content = exps[3], m;

  m = this._wrapCondRe.exec(code);
  if (m) {
    code = code.replace(m[2], '(' + m[2] + ')');
  }

  code = this._expandCallback(code, content);
  return ['slm', 'control', code, this.compile(content)];
};

BracketsProto.on_slm_output = function(exps) {
  var code = exps[3], content = exps[4];
  code = this._expandCallback(code, content);
  return ['slm', 'output', exps[2], code, this.compile(content)];
};

BracketsProto._expandCallback = function(code, content) {
  var postCode = '}', m, index;
  if (!this._blockRe.test(code) && !this._isEmptyExp(content)) {
    if (!this._ifRe.test(code)) {
      m = this._callbackRe.exec(code);
      if (m) {
        index = m.index + m[1].length;
        postCode += code.slice(index);
        code = code.slice(0, index);
      } else if ((index = code.lastIndexOf(')')) !== -1) {
        var firstIndex = code.indexOf('(');
        if (firstIndex !== -1) {
          var args = code.slice(firstIndex + 1, index);
          postCode += code.slice(index);
          if (/^\s*$/.test(args)) {
            code = code.slice(0, index) + 'function()';
          } else {
            code = code.slice(0, index) + ',function()';
          }
        }
      }
    }
    code += '{';
    content.push(['code', postCode]);

  }
  return code;
};

module.exports = Brackets;

},{"./slm":17}],10:[function(require,module,exports){
var Slm = require('./slm');

function CodeAttributes() {
  this._attr = null;
  this._mergeAttrs = {'class':' '};
}

var CodeAttributesProto = CodeAttributes.prototype = new Slm();

CodeAttributesProto.on_html_attrs = CodeAttributesProto._shiftAndCompileMulti;

CodeAttributesProto.on_html_attr = function(exps) {
  var name = exps[2], value = exps[3];
  if (value[0] === 'slm' && value[1] === 'attrvalue' && !this._mergeAttrs[name]) {
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

CodeAttributesProto.on_slm_attrvalue = function(exps) {
  var escape = exps[2], code = exps[3];
  // We perform attribute merging on Array values
  var delimiter = this._mergeAttrs[this._attr];
  if (delimiter) {
    var tmp = this._uniqueName();
    return ['multi',
     ['code', 'var ' + tmp + '=' + code + ';'],
     ['if', tmp + ' instanceof Array',
      ['multi',
        ['code',  tmp + '=rt.rejectEmpty(rt.flatten(' + tmp + '));'],
       ['escape', escape, ['dynamic', tmp + '.join("'+ delimiter +'")']]],
      ['escape', escape, ['dynamic', tmp]]]];
  }
  return ['escape', escape, ['dynamic', code]];
};

module.exports = CodeAttributes;

},{"./slm":17}],11:[function(require,module,exports){
var Slm = require('./slm');

function ControlFlow() {}

var FlowProto = ControlFlow.prototype = new Slm();

FlowProto.on_switch = function(exps) {
  var arg = exps[1], res = ['multi', ['code', 'switch(' + arg + '){']];

  for (var i = 2, l = exps.length; i < l; i++) {
    var exp = exps[i];
    res.push(['code', exp[0] === 'default' ? 'default:' : 'case ' + exp[0] + ':']);
    res.push(this.compile(exp[1]));
  }

  res.push(['code', '}']);
  return res;
};

FlowProto.on_if = function(exps) {
  var condition = exps[1], yes = exps[2], no = exps[3];

  var result = ['multi', ['code', 'if(' + condition + '){'], this.compile(yes)];
  if (no) {
    result.push(['code', '}else{']);
    result.push(this.compile(no));
  }
  result.push(['code', '}']);
  return result;
};

FlowProto.on_block = function(exps) {
  var code = exps[1], exp = exps[2];
  return ['multi', ['code', code], this.compile(exp)];
};

module.exports = ControlFlow;

},{"./slm":17}],12:[function(require,module,exports){
var Slm = require('./slm');

function Control() {
  this._ifRe = /^(if)\b|{\s*$/;
}

var ControlProto = Control.prototype = new Slm();

ControlProto.on_slm_control = function(exps) {
  return ['multi', ['code', exps[2]], this.compile(exps[3])];
};

ControlProto.on_slm_output = function(exps) {
  var escape = exps[2], code = exps[3], content = exps[4];
  if (this._ifRe.test(code)) {
    var tmp = this._uniqueName(), tmp2 = this._uniqueName();
    content = this.compile(content);
    content.splice(content.length - 1, 0, ['code', 'return rt.safe(' + tmp2 + ');']);
    return ['multi',
      // Capture the result of the code in a variable. We can't do
      // `[:dynamic, code]` because it's probably not a complete
      // expression (which is a requirement for Temple).
      ['block', 'var ' + tmp + '=' + code,

        // Capture the content of a block in a separate buffer. This means
        // that `yield` will not output the content to the current buffer,
        // but rather return the output.
        //
        // The capturing can be disabled with the option :disable_capture.
        // Output code in the block writes directly to the output buffer then.
        // Rails handles this by replacing the output buffer for helpers.
        // options[:disable_capture] ? compile(content) : [:capture, unique_name, compile(content)]],
        ['capture', tmp2, "var " + tmp2 + "='';", content]],

       // Output the content.
      ['escape', 'escape', ['dynamic', tmp]]
    ];
  }
  return ['multi', ['escape', escape, ['dynamic', code]], content];
};

ControlProto.on_slm_text = function(exps) {
  return this.compile(exps[2]);
};

module.exports = Control;

},{"./slm":17}],13:[function(require,module,exports){
var Slm = require('./slm');

function TextCollector() {}
var TextProto = TextCollector.prototype = new Slm();

TextProto.exec = function(exp) {
  this._collected = '';
  Slm.prototype.exec.call(this, exp);
  return this._collected;
};

TextProto.on_slm_interpolate = function(exps) {
  this._collected += exps[2];
};

function NewlineCollector() {}
var NewlineProto = NewlineCollector.prototype = new Slm();

NewlineProto.exec = function(exp) {
  this._collected = ['multi'];
  Slm.prototype.exec.call(this, exp);
  return this._collected;
};

NewlineProto.on_newline = function() {
  this._collected.push(['newline']);
};

function Engine() {
  this._textCollector = new TextCollector();
  this._newlineCollector = new NewlineCollector();
}
var EngineProto = Engine.prototype = new Slm();

EngineProto.collectText = function(body) {
  return this._textCollector.exec(body);
};

EngineProto.collectNewlines = function(body) {
  return this._newlineCollector.exec(body);
};

function Javascript(options) {
  this._withType = options && options.typeAttribute;
}
Javascript.prototype = new Engine();

Javascript.prototype.on_slm_embedded = function(exps) {
  var body = exps[3];
  if (this._withType) {
    return ['html', 'tag', 'script',['html', 'attrs',
      ['html', 'attr', 'type', ['static', 'text/javascript']]], body];
  } else {
    return ['html', 'tag', 'script', ['html', 'attrs'], body];
  }
};

function CSS(){}
CSS.prototype = new Engine();

CSS.prototype.on_slm_embedded = function(exps) {
  var body = exps[3];
  return ['html', 'tag', 'style', ['html', 'attrs',
    ['html', 'attr', 'type', ['static', 'text/css']]], body];
};

function Embedded() {
  this._engines = {};
}

var EmbeddedProto = Embedded.prototype = new Slm();

EmbeddedProto.register = function(name, filter) {
  this._engines[name] = filter;
};

EmbeddedProto.on_slm_embedded = function(exps) {
  var name = exps[2];
  var engine = this._engines[name];
  if (!engine) {
    throw new Error('Embedded engine ' + name + ' is not registered.');
  }
  return this._engines[name].on_slm_embedded(exps);
};

var InterpolateEngine = function(renderer) {
  this.renderer = renderer;
};

var InterpolateProto = InterpolateEngine.prototype = new Engine();

InterpolateProto.on_slm_embedded = function(exps) {
  var body = exps[3];
  var text = this.collectText(body);
  return ['multi', ['slm', 'interpolate', this.renderer(text)]];
};

module.exports = {
  Embedded: Embedded,
  Javascript: Javascript,
  CSS: CSS,
  TextCollector: TextCollector,
  NewlineCollector: NewlineCollector,
  InterpolateEngine: InterpolateEngine
};

},{"./slm":17}],14:[function(require,module,exports){
var Filter = require('../filter');
var Runtime = require('../runtime');

function Escape() {
  this._disableEscape = false;
  this._escape = false;
  this._escaper = Runtime.escape;
}

var EscapeProto = Escape.prototype = new Filter();

EscapeProto._escapeCode = function(v) {
  return 'rt.escape(' + v.replace(/;+$/, '') + ')';
};

EscapeProto.on_escape = function(exps) {
  var old = this.escape;
  this._escape = exps[1] && !this._disableEscape;
  try {
    return this.compile(exps[2]);
  } finally {
    this._escape = old;
  }
};

EscapeProto.on_static = function(exps) {
  return ['static', this._escape ? this._escaper(exps[1]) : exps[1]];
};

EscapeProto.on_dynamic = function(exps) {
  return ['dynamic', this._escape ? this._escapeCode(exps[1]) : exps[1]];
};

module.exports = Escape;

},{"../filter":6,"../runtime":24}],15:[function(require,module,exports){
var Slm = require('./slm');

function Interpolate() {
  this._escapedInterpolationRe = /^\\\$\{/;
  this._interpolationRe = /^\$\{/;
  this._staticTextRe = /^([\$\\]?[^$\\]*(\$\\][^\\\$\{][^\$\\]*)*)/;
}

var InterpolateProto = Interpolate.prototype = new Slm();

InterpolateProto.on_slm_interpolate = function(exps) {
  var str = exps[2], m, code;

  // Interpolate variables in text (${variable}).
  // Split the text into multiple dynamic and static parts.
  var block = ['multi'];
  do {
    // Escaped interpolation
    m = this._escapedInterpolationRe.exec(str);
    if (m) {
      block.push(['static', '${']);
      str = str.slice(m[0].length);
    } else if (m = this._interpolationRe.exec(str)) {
      // Interpolation
      var res = this._parseExpression(str.slice(m[0].length));
      str = res[0];
      code = res[1];
      var escape = code[0] !== '=';
      block.push(['slm', 'output', escape, escape ? code : code.slice(1), ['multi']]);
    } else {
      m = this._staticTextRe.exec(str);
      if (m) {
        // Interpolation
        block.push(['static', m[0]]);
        str = str.slice(m[0].length);
      }
    }
  } while (str.length);

  return block;
};

InterpolateProto._parseExpression = function(str) {
  for (var count = 1, i = 0, l = str.length; i < l && count; i++) {
    if (str[i] === '{') {
      count++;
    } else if (str[i] === '}') {
      count--;
    }
  }

  if (count) {
    throw new Error('Text interpolation: Expected closing }');
  }

  return [str.slice(i), str.substring(0, i - 1)];
};

module.exports = Interpolate;

},{"./slm":17}],16:[function(require,module,exports){
var Filter = require('../filter');

// Flattens nested multi expressions

function MultiFlattener() {}
MultiFlattener.prototype = new Filter();

MultiFlattener.prototype.on_multi = function(exps) {
  // If the multi contains a single element, just return the element
  var len = exps.length;
  if (len === 2) {
    return this.compile(exps[1]);
  }

  var res = ['multi'];

  for (var i = 1; i < len; i++) {
    var exp = exps[i];
    exp = this.compile(exp);
    if (exp[0] === 'multi') {
      for (var j = 1, l = exp.length; j < l; j++) {
        res.push(exp[j]);
      }
    } else {
      res.push(exp);
    }
  }

  return res;
};

module.exports = MultiFlattener;

},{"../filter":6}],17:[function(require,module,exports){
var Filter = require('../html/html');

function Slm() {}
var SlmProto = Slm.prototype = new Filter();

// Pass-through handlers
SlmProto.on_slm_text = function(exps) {
  exps[2] = this.compile(exps[2]);
  return exps;
};

SlmProto.on_slm_embedded = function(exps) {
  exps[3] = this.compile(exps[3]);
  return exps;
};

SlmProto.on_slm_control = function(exps) {
  exps[3] = this.compile(exps[3]);
  return exps;
};

SlmProto.on_slm_output = function(exps) {
  exps[4] = this.compile(exps[4]);
  return exps;
};

module.exports = Slm;

},{"../html/html":22}],18:[function(require,module,exports){
var Filter = require('../filter');

/**
* Merges several statics into a single static.  Example:
*
*   ['multi',
*     ['static', 'Hello '],
*     ['static', 'World!']]
*
* Compiles to:
*
*   ['static', 'Hello World!']
*/

function StaticMerger() {}
StaticMerger.prototype = new Filter();

StaticMerger.prototype.on_multi = function(exps) {
  var res = ['multi'], node;

  for (var i = 1, l = exps.length; i < l; i++) {
    var exp = exps[i];
    if (exp[0] === 'static') {
      if (node) {
        node[1] += exp[1];
      } else {
        node = ['static', exp[1]];
        res.push(node);
      }
    } else {
      res.push(this.compile(exp));
      if (exp[0] !== 'newline') {
        node = null;
      }
    }
  }

  return res.length === 2 ? res[1] : res;
};

module.exports = StaticMerger;

},{"../filter":6}],19:[function(require,module,exports){
var Dispatcher = require('./dispatcher');

function Generator() {
  this._buffer = '_b';
}

var GeneratorProto = Generator.prototype = new Dispatcher();

GeneratorProto.exec = function(exp) {
  return [this.preamble(), this.compile(exp)].join('\n');
};

GeneratorProto.on = function(exp) {
  throw new Error('Generator supports only core expressions - found ' + JSON.stringify(exp));
};

GeneratorProto.on_multi = function(exps) {
  for (var i = 1, l = exps.length; i < l; i++) {
    exps[i] = this.compile(exps[i]);
  }
  exps.shift();
  return exps.join('\n');
};

GeneratorProto.on_newline = function() {
  return '\n';
};

GeneratorProto.on_static = function(exps) {
  return this.concat(JSON.stringify(exps[1]));
};

GeneratorProto.on_dynamic = function(exps) {
  return this.concat(exps[1]);
};

GeneratorProto.on_code = function(exps) {
  return exps[1];
};

GeneratorProto.concat = function(str) {
  return this._buffer + '+=' + str + ';';
};

module.exports = Generator;

},{"./dispatcher":3}],20:[function(require,module,exports){
var Generator = require('../generator');

function StringGenerator(name, initializer) {
  this._buffer = name || '_b';
  this._initializer = initializer;
}
var StringGeneratorProto = StringGenerator.prototype = new Generator();

StringGeneratorProto.preamble = function() {
  return this._initializer ? this._initializer : 'var ' + this._buffer + '=\'\';';
};

StringGeneratorProto.on_capture = function(exps) {
  var generator = new StringGenerator(exps[1], exps[2]);
  generator._dispatcher = this._dispatcher;
  return generator.exec(exps[3]);
};

module.exports = StringGenerator;

},{"../generator":19}],21:[function(require,module,exports){
var Html = require('./html');

function Fast() {

  this._format = 'xhtml';
  this._attrQuote = '"';
  this._autoclose  = 'base basefont bgsound link meta area br embed img keygen wbr input menuitem param source track hr col frame'.split(/\s/);
  this._jsWrapper = ['\n//<![CDATA[\n', '\n//]]>\n'];
}

var FastProto = Fast.prototype = new Html();

FastProto.on_html_doctype = function(exps) {
  var type = exps[2];

  var XHTML_DOCTYPES = {
    '1.1'          : '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
    '5'            : '<!DOCTYPE html>',
    'html'         : '<!DOCTYPE html>',
    'strict'       : '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
    'frameset'     : '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">',
    'basic'        : '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">',
    'transitional' : '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
    'svg'          : '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">'
  };

  var HTML_DOCTYPES = {
    '5'            : '<!DOCTYPE html>',
    'html'         : '<!DOCTYPE html>',
    'strict'       : '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">',
    'frameset'     : '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN" "http://www.w3.org/TR/html4/frameset.dtd">',
    'transitional' : '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">'
  };

  type = type.toString().toLowerCase();
  var m, str;

  m = /^xml(\s+(.+))?$/.exec(type);
  if (m) {
    if (this._format !== 'xhtml') {
      throw new Error('Invalid xml directive in html mode');
    }
    var w = this._attrQuote;
    str = '<?xml version=' + w + '1.0' + w + ' encoding=' + w + (m[2] || 'utf-8') + w + ' ?>';
  } else if (this._format !== 'xhtml') {
    str = HTML_DOCTYPES[type];
    if (!str) {
      throw new Error('Invalid html doctype ' + type);
    }
  } else {
    str = XHTML_DOCTYPES[type];
    if (!str) {
      throw new Error('Invalid xhtml doctype ' + type);
    }
  }

  return ['static', str];
};

FastProto.on_html_comment = function(exps) {
  return ['multi', ['static', '<!--'], this.compile(exps[2]), ['static', '-->']];
};

FastProto.on_html_condcomment = function(exps) {
  return this.on_html_comment(['html', 'comment', [
    'multi',
      ['static', '[' + exps[2] + ']>'], exps[3], ['static', '<![endif]']]]);
};

FastProto.on_html_tag = function(exps) {
  var name = exps[2].toString(), attrs = exps[3], content = exps[4];

  var closed = !content || (this._isEmptyExp(content) && this._autoclose.indexOf(name) !== -1);

  var res = [
    'multi',
      ['static', '<' + name],
      this.compile(attrs),
      ['static', (closed && this._format === 'xhtml' ? ' /' : '') + '>']
    ];

  if (content) {
    res.push(this.compile(content));
  }
  if (!closed) {
    res.push(['static', '</' + name + '>']);
  }
  return res;
};

FastProto.on_html_attrs = FastProto._shiftAndCompileMulti;

FastProto.on_html_attr = function(exps) {
  var name = exps[2], value = exps[3];

  if (this._format !== 'xhtml' && this._isEmptyExp(value)) {
    return ['static', ' ' + name];
  }
  return ['multi',
    ['static', ' ' + name + '=' + this._attrQuote],
    this.compile(value),
    ['static', this._attrQuote]];
};

FastProto.on_html_js = function(exps) {
  var content = exps[2];

  return ['multi',
     ['static', this._jsWrapper[0]],
     this.compile(content),
     ['static', this._jsWrapper[1]]];
};

module.exports = Fast;

},{"./html":22}],22:[function(require,module,exports){
var Filter = require('../filter');

function Html() {}
var HtmlProto = Html.prototype = new Filter();

HtmlProto.on_html_attrs = HtmlProto._shiftAndCompile;

HtmlProto.on_html_attr = function(exps) {
  return ['html', 'attr', exps[2], this.compile(exps[3])];
};

HtmlProto.on_html_comment = function(exps) {
  return ['html', 'comment', this.compile(exps[2])];
};

HtmlProto.on_html_condcomment = function(exps) {
  return ['html', 'condcomment', exps[2], this.compile(exps[3])];
};

HtmlProto.on_html_tag = function(exps) {
  var content = exps[4];
  var res = ['html', 'tag', exps[2], this.compile(exps[3])];
  if (content) {
    res.push(this.compile(content));
  }
  return res;
};

HtmlProto._isContainNonEmptyStatic = function(exp) {
  switch (exp[0]) {
  case 'multi':
    for (var i = 1, l = exp.length; i < l; i++) {
      if (this._isContainNonEmptyStatic(exp[i])) {
        return true;
      }
    }
    return false;
  case 'escape':
    return this._isContainNonEmptyStatic(exp[exp.length - 1]);
  case 'static':
    return exp[1].length;
  default:
    return false;
  }
};

module.exports = Html;

},{"../filter":6}],23:[function(require,module,exports){

function Parser() {
  this._file = null;
  this._lineno = 0;
  this._lines = [];
  this._indents = [0];
  this._line = this._origLine = null;

  this._tagShortcut = {
    '.': 'div',
    '#': 'div'
  };
  this._attrShortcut = {
    '#': ['id'],
    '.': ['class']
  };
  this._attrDelims = {
    '(' : ')',
    '[' : ']'
  };

  this._tagRe = /^(?:#|\.|\*(?=[^\s]+)|(\w+(?:\w+|:|-)*\w|\w+))/;
  this._attrShortcutRe = /^([\.#]+)((?:\w+|-)*)/;

  this._attrName = '^\\s*([^\\0\\"\'><\\/=\\s\\[\\]()\\.#]+)';
  this._quotedAttrRe = new RegExp(this._attrName + '\\s*=(=?)\\s*("|\')');
  this._codeAttrRe = new RegExp(this._attrName + '\\s*=(=?)\\s*');

  this._delimRe = /^[\(\)\[\]]/;
  this._attrDelimRe = /^\s*([\(\)\[\]])/;
  this._newLineRe = /\r?\n/;
  this._emptyLineRe = /^\s*$/;
  this._htmlCommentRe = /^\/!(\s?)/;
  this._htmlConditionalCommentRe = /^\/\[\s*(.*?)\s*\]\s*$/;
  this._blockExpressionRe = /^\s*:\s*/;
  this._doctypeRe = /^doctype\b/i;
  this._textBlockRe = /^((\.)(\s|$))|((\|)(\s?))/;
  this._outputBlockRe = /^=(=?)([.<>]*)/;
  this._outputCodeRe  = /^\s*=(=?)([.<>]*)/;
  this._embededRe = /^(\w+):\s*$/;
  this._closedTagRe = /^\s*\/\s*/;
  this._textContentRe = /^( ?)(.*)$/;
  this._indentRegex  = /^[ \t]+/;
  this._indentationRe = /^\s+/;
  this._nextLineRe = /[,\\]$/;
  this._tabRe = /\t/g;
}

var ParserProto = Parser.prototype;

ParserProto._escapeRegExp = function(str) {
  if (!str) {
    return '';
  }
  return str.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
};

ParserProto._reset = function(lines, stacks) {
  this._stacks = stacks || [];
  this._indents = [0];
  this._indents.last = this._stacks.last = function() {
    return this[this.length - 1];
  };
  this._lineno = 0;
  this._lines = lines;
  this._line = this._origLine = null;
};

ParserProto._pushOnTop = function(item) {
  this._stacks.last().push(item);
};

ParserProto._nextLine = function() {
  if (this._lines.length) {
    this._origLine = this._lines.shift();
    this._lineno++;
    this._line = this._origLine;
  } else {
    this._origLine = this._line = null;
  }

  return this._line;
};

ParserProto._getIndent = function(line) {
  var m = line.match(this._indentRegex);
  return m ? m[0].replace(this._tabRe, ' ').length : 0;
};

ParserProto.exec = function(str, options) {
  if (options && options.file) {
    this._file = options.file;
  } else {
    this._file = null;
  }
  var res = ['multi'];
  this._reset(str.split(this._newLineRe), [res]);

  while (this._nextLine() !== null) {
    this._parseLine();
  }

  this._reset();

  return res;
};

ParserProto._parseLine = function() {
  if (this._emptyLineRe.test(this._line)) {
    this._pushOnTop(['newline']);
    return;
  }

  var indent = this._getIndent(this._line);

  // Remove the indentation
  this._line = this._line.replace(this._indentationRe, '');

  // If there's more stacks than indents, it means that the previous
  // line is expecting this line to be indented.
  var expectingIndentation = this._stacks.length > this._indents.length;

  if (indent > this._indents.last()) {
    // This line was actually indented, so we'll have to check if it was
    // supposed to be indented or not.

    if (!expectingIndentation) {
      this._syntaxError('Unexpected indentation');
    }

    this._indents.push(indent);
  } else {
    // This line was *not* indented more than the line before,
    // so we'll just forget about the stack that the previous line pushed.
    if (expectingIndentation) {
      this._stacks.pop();
    }

    // This line was deindented.
    // Now we're have to go through the all the indents and figure out
    // how many levels we've deindented.
    while(indent < this._indents.last()) {
      this._indents.pop();
      this._stacks.pop();
    }

    // This line's indentation happens lie "between" two other line's
    // indentation:
    //
    //   hello
    //       world
    //     this      # <- This should not be possible!

    if (indent !== this._indents.last()) {
      this._syntaxError('Malformed indentation');
    }
  }

  this._parseLineIndicators();
};

ParserProto._parseLineIndicators = function() {
  do {
    var m;

    // HTML comment
    m = this._htmlCommentRe.exec(this._line);
    if (m) {
      this._pushOnTop(['html', 'comment',
        [
          'slm', 'text',
          this._parseTextBlock(this._line.slice(m[0].length),
          this._indents.last() + m[1].length + 2)
        ]
      ]);
      break;
    }

    // HTML conditional comment
    m = this._htmlConditionalCommentRe.exec(this._line);
    if (m) {
      var block = ['multi'];
      this._pushOnTop(['html', 'condcomment', m[1], block]);
      this._stacks.push(block);
      break;
    }

    var firstChar = this._line[0];

    // Slm comment
    if (firstChar === '/') {
      this._parseCommentBlock();
      break;
    }

    // Text block.
    m = this._textBlockRe.exec(this._line);
    if (m) {
      var char, space;
      if (m[2] === undefined) {
        char = m[5];
        space = m[6];
      } else {
        char = m[2];
        space = m[3];
      }
      var trailingWS = char === '.';

      this._pushOnTop([
        'slm', 'text',
        this._parseTextBlock(this._line.slice(m[0].length),
        this._indents.last() + space.length + 1)
      ]);

      if (trailingWS) {
        this._pushOnTop(['static', ' ']);
      }

      break;
    }

    // Inline html
    if (firstChar === '<') {
      var block = ['multi'];
      this._pushOnTop(['multi', ['slm', 'interpolate', this._line], block]);
      this._stacks.push(block);
      break;
    }

    // Code block.
    if (firstChar === '-') {
      // We expect the line to be broken or the next line to be indented.
      this._line = this._line.slice(1);
      var block = ['multi'];
      this._pushOnTop(['slm', 'control', this._parseBrokenLine(), block]);
      this._stacks.push(block);
      break;
    }

    // Output block.
    m = this._outputBlockRe.exec(this._line);
    if (m) {
      // We expect the line to be broken or the next line to be indented.
      this._line = this._line.slice(m[0].length);

      var trailingWS = m[2].indexOf('.') !== -1 || m[2].indexOf('>') !== -1;
      var block = ['multi'];
      if (m[2].indexOf('<') !== -1) {
        this._pushOnTop(['static', ' ']);
      }
      this._pushOnTop(['slm', 'output', m[1].length === 0, this._parseBrokenLine(), block]);
      if (trailingWS) {
        this._pushOnTop(['static', ' ']);
      }
      this._stacks.push(block);

      break;
    }

    // Embedded template.
    m = this._embededRe.exec(this._line);
    if (m) {
      // It is treated as block.
      this._pushOnTop(['slm', 'embedded', m[1], this._parseTextBlock()]);
      break;
    }

    // Doctype declaration
    m = this._doctypeRe.exec(this._line);
    if (m) {
      var value = this._line.slice(m[0].length).trim();
      this._pushOnTop(['html', 'doctype', value]);
      break;
    }

    // HTML tag
    m = this._tagRe.exec(this._line);
    if (m) {
      if (m[1]) {
        this._line = this._line.slice(m[0].length);
      }
      this._parseTag(m[0]);

      break;
    }

    this._syntaxError('Unknown line indicator');


  } while (false);

  this._pushOnTop(['newline']);
};

ParserProto._parseTag = function(tag) {
  var m;
  if (this._tagShortcut[tag]) {
    if (!this._attrShortcut[tag]) {
      this._line = this._line.slice(0, tag.length);
    }

    tag = this._tagShortcut[tag];
  }


  // Find any shortcut attributes
  var attributes = ['html', 'attrs'];
  while (m = this._attrShortcutRe.exec(this._line)) {
    // The class/id attribute is :static instead of 'slm' 'interpolate',
    // because we don't want text interpolation in .class or #id shortcut
    var shortcut = this._attrShortcut[m[1]];
    if (!shortcut) {
      this._syntaxError('Illegal shortcut');
    }

    for (var i = 0, a; a = shortcut[i]; i++) {
      attributes.push(['html', 'attr', a, ['static', m[2]]]);
    }

    this._line = this._line.slice(m[0].length);
  }

  var trailingWS, leadingWS;
  m = /^[<>.]+/.exec(this._line);
  if (m) {
    this._line = this._line.slice(m[0].length);
    trailingWS = m[0].indexOf('.') >= 0 || m[0].indexOf('>') >= 0;
    leadingWS = m[0].indexOf('<') >= 0;
  }

  this._parseAttributes(attributes);

  tag = ['html', 'tag', tag, attributes];

  if (leadingWS) {
    this._pushOnTop(['static', ' ']);
  }
  this._pushOnTop(tag);
  if (trailingWS) {
    this._pushOnTop(['static', ' ']);
  }

  do {
    // Block expansion
    m = this._blockExpressionRe.exec(this._line);
    if (m) {
      this._line = this._line.slice(m[0].length);
      if (!(m = this._tagRe.exec(this._line))) {
        this._syntaxError('Expected tag');
      }

      if (m[1]) {
        this._line = this._line.slice(m[0].length);
      }

      var content = ['multi'];
      tag.push(content);

      var i = this._stacks.length;
      this._stacks.push(content);
      this._parseTag(m[0]);
      this._stacks.splice(i, 1);

      break;
    }

    // Handle output code
    m = this._outputCodeRe.exec(this._line);
    if (m) {

      this._line = this._line.slice(m[0].length);
      var trailingWS2 = m[2].indexOf('.') >= 0 || m[2].indexOf('>') >= 0;
      var leadingWS2 = m[2].indexOf('<') >= 0;

      var block = ['multi'];

      if (!leadingWS && leadingWS2) {
        var lastStack = this._stacks.last();
        lastStack.insert(lastStack.length - 2, 0, ['static', ' ']);
      }

      tag.push(['slm', 'output', m[1] !== '=', this._parseBrokenLine(), block]);
      if (!trailingWS && trailingWS2) {
        this._pushOnTop(['static', ' ']);
      }
      this._stacks.push(block);
      break;
    }

    // Closed tag. Do nothing
    m = this._closedTagRe.exec(this._line);
    if (m) {
      this._line = this._line.slice(m[0].length);
      if (this._line.length) {
        this._syntaxError('Unexpected text after closed tag');
      }
      break;
    }

    // Empty content
    if (this._emptyLineRe.test(this._line)) {
      var content = ['multi'];
      tag.push(content);
      this._stacks.push(content);
      break;
    }

    // Text content
    m = this._textContentRe.exec(this._line);
    if (m) {
      tag.push(['slm', 'text', this._parseTextBlock(m[2], this._origLine.length - this._line.length + m[1].length, true)]);
      break;
    }

  } while (false);
};

ParserProto._parseAttributes = function(attributes) {
  // Check to see if there is a delimiter right after the tag name
  var delimiter, m;

  m = this._attrDelimRe.exec(this._line);
  if (m) {
    delimiter = this._attrDelims[m[1]];
    this._line = this._line.slice(m[0].length);
  }

  var booleanAttrRe, endRe;
  if (delimiter) {
    booleanAttrRe = new RegExp(this._attrName + '(?=(\\s|' + this._escapeRegExp(delimiter) + '|$))');
    endRe = new RegExp('^\\s*'+ this._escapeRegExp(delimiter));
  }

  while (true) {
    // Value is quoted (static)
    m = this._quotedAttrRe.exec(this._line);
    if (m) {
      this._line = this._line.slice(m[0].length);
      attributes.push(['html', 'attr', m[1],
                      ['escape', !m[2].length, ['slm', 'interpolate', this._parseQuotedAttribute(m[3])]]]);
      continue;
    }

    // Value is JS code
    m = this._codeAttrRe.exec(this._line);
    if (m) {
      this._line = this._line.slice(m[0].length);
      var name = m[1], escape = !m[2].length;
      var value = this._parseJSCode(delimiter);

      if (!value.length) {
        this._syntaxError('Invalid empty attribute');
      }
      attributes.push(['html', 'attr', name, ['slm', 'attrvalue', escape, value]]);
      continue;
    }

    if (!delimiter) {
      break;
    }

    // Boolean attribute
    m = booleanAttrRe.exec(this._line);
    if (m) {
      this._line = this._line.slice(m[0].length);
      attributes.push(['html', 'attr', m[1], ['multi']]);
      continue;
    }
    // Find ending delimiter
    m = endRe.exec(this._line);
    if (m) {
      this._line = this._line.slice(m[0].length);
      break;
    }

    // Found something where an attribute should be
    this._line = this._line.replace(this._indentationRe, '');
    if (this._line.length) {
      this._syntaxError('Expected attribute');
    }

    // Attributes span multiple lines
    this._pushOnTop(['newline']);

    if (!this._lines.length) {
      this._syntaxError('Expected closing delimiter ' + delimiter);
    }
    this._nextLine();
  }
};

ParserProto._parseTextBlock = function(firstLine, textIndent, inTag) {
  var result = ['multi'];

  if (!firstLine || !firstLine.length) {
    textIndent = null;
  } else {
    result.push(['slm', 'interpolate', firstLine]);
  }

  var emptyLines = 0;

  while (this._lines.length) {
    if (this._emptyLineRe.test(this._lines[0])) {
      this._nextLine();
      result.push(['newline']);

      if (textIndent) {
        emptyLines++;
      }
    } else {
      var indent = this._getIndent(this._lines[0]);

      if (indent <= this._indents.last()) {
        break;
      }

      if (emptyLines) {
        result.push(['slm', 'interpolate', new Array(emptyLines + 1).join('\n')]);
        emptyLines = 0;
      }

      this._nextLine();
      this._line = this._line.replace(this._indentationRe, '');

      // The text block lines must be at least indented
      // as deep as the first line.

      var offset = textIndent ? indent - textIndent : 0;

      if (offset < 0) {
        this._syntaxError('Text line not indented deep enough.\n' +
                         'The first text line defines the necessary text indentation.' +
                         (inTag ? '\nAre you trying to nest a child tag in a tag containing text? Use | for the text block!' : ''));
      }

      result.push(['newline']);
      result.push(['slm', 'interpolate', (textIndent ? '\n' : '') + new Array(offset + 1).join(' ') + this._line]);

      // The indentation of first line of the text block
      // determines the text base indentation.
      textIndent = textIndent || indent;
    }
  }

  return result;
};

ParserProto._parseCommentBlock = function() {
  while (this._lines.length) {
    var indent = this._emptyLineRe.test(this._lines[0]) ? 0 : this._getIndent(this._lines[0]);

    if (indent <= this._indents.last()) {
      break;
    }

    this._nextLine();
    this._pushOnTop(['newline']);
  }
};

ParserProto._parseBrokenLine = function() {
  var brokenLine = this._line.trim(), m;
  while (m = this._nextLineRe.exec(brokenLine)) {
    this._expectNextLine();
    if (m[0] === '\\') {
      brokenLine = brokenLine.slice(0, brokenLine.length - 2);
    }
    brokenLine += '\n' + this._line;
  }
  return brokenLine;
};

ParserProto._parseJSCode = function(outerDelimeter) {
  var code = '', count = 0, delimiter, closeDelimiter, m;

  // Attribute ends with space or attribute delimiter
  var endRe = new RegExp('^[\\s' +this._escapeRegExp(outerDelimeter) + ']');

  while (this._line.length && (count || !endRe.test(this._line))) {
    if (this._nextLineRe.test(this._line)) {
      code += this._line + '\n';
      this._expectNextLine();
    } else {
      if (count > 0) {
        if (this._line[0] === delimiter[0]) {
          count++;
        } else if (this._line[0] === closeDelimiter[0]) {
          count--;
        }
      } else if (m = this._delimRe.exec(this._line)) {

        count = 1;
        delimiter = m[0];
        closeDelimiter = this._attrDelims[m[0]];
      }

      code += this._line[0];
      this._line = this._line.slice(1);
    }
  }

  if (count) {
    this._syntaxError('Expected closing delimiter ' + closeDelimiter);
  }
  return code;
};

ParserProto._parseQuotedAttribute = function(quote) {
  var value = '', count = 0;

  while (this._line.length && (count || this._line[0] !== quote)) {
    if (/^\\$/.test(this._line)) {
      value += ' ';
      this._expectNextLine();
    } else {
      var firstChar = this._line[0];
      if (count > 0) {
        if (firstChar === '{') {
          count++;
        } else if (firstChar === '}') {
          count--;
        }
      } else if (/^\$\{/.test(this._line)) {
        value += firstChar;
        this._line = this._line.slice(1);
        count = 1;
      }

      value += this._line[0];
      this._line = this._line.slice(1);
    }
  }

  if (count) {
    this._syntaxError('Expected closing brace }');
  }

  if (this._line[0] !== quote) {
    this._syntaxError('Expected closing quote ' + quote);
  }

  this._line = this._line.slice(1);

  return value;
};

ParserProto._syntaxError = function(message) {
  var column = (this._origLine !== null && this._line !== null) ? this._origLine.length - this._line.length : 0;
  column += 1;
  var msg = [
    message,
    '  ' + (this._file || '(__TEMPLATE__)') + ', Line ' + this._lineno + ', Column ' + column,
    '  ' + this._origLine,
    '  ' + new Array(column).join(' ') + '^',
    ''
  ].join('\n');
  throw new Error(msg);
};

ParserProto._expectNextLine = function() {
  if (this._nextLine() === null) {
    this._syntaxError('Unexpected end of file');
  }
  this._line = this._line.trim();
};

module.exports = Parser;

},{}],24:[function(require,module,exports){
var escapeRe = /[&<>"]/;
var ampRe = /&/g;
var ltRe = /</g;
var gtRe = />/g;
var quotRe = /"/g;

function safe(val) {
  if (!val || val.htmlSafe) {
    return val;
  }

  var res = new String(val);
  res.htmlSafe = true;
  return res;
}

function escape(str) {
  if (typeof str !== 'string') {
    if (!str) {
      return '';
    }
    if (str.htmlSafe) {
      return str.toString();
    }
    str = str.toString();
  }

  if (escapeRe.test(str) ) {
    if (str.indexOf('&') !== -1) {
      str = str.replace(ampRe, '&amp;');
    }
    if (str.indexOf('<') !== -1) {
      str = str.replace(ltRe, '&lt;');
    }
    if (str.indexOf('>') !== -1) {
      str = str.replace(gtRe, '&gt;');
    }
    if (str.indexOf('"') !== -1) {
      str = str.replace(quotRe, '&quot;');
    }
  }

  return str;
}

function rejectEmpty(arr) {
  var res = [];

  for (var i = 0, l = arr.length; i < l; i++) {
    var el = arr[i];
    if (el !== null && el.length) {
      res.push(el);
    }
  }

  return res;
}

function flatten(arr) {
  return arr.reduce(function (acc, val) {
    if (val === null) {
      return acc;
    }
    return acc.concat(val.constructor === Array ? flatten(val) : val.toString());
  }, []);
}

module.exports = {
  safe: safe,
  escape: escape,
  rejectEmpty: rejectEmpty,
  flatten: flatten
};

},{}],25:[function(require,module,exports){
var AttrMerge = require('./filters/attr_merge');
var AttrRemove = require('./filters/attr_remove');
var Brackets = require('./filters/brackets');
var CodeAttributes = require('./filters/code_attributes');
var ControlFlow = require('./filters/control_flow');
var Controls = require('./filters/controls');
var Embeddeds = require('./filters/embedded');
var Engine = require('./engine');
var Escape = require('./filters/escape');
var FastHtml = require('./html/fast');
var Interpolate = require('./filters/interpolate');
var MultiFlattener = require('./filters/multi_flattener');
var Parser = require('./parser');
var Runtime = require('./runtime');
var StaticMerger = require('./filters/static_merger');
var StringGenerator = require('./generators/string');

function Template(ctx) {
  this.Ctx = ctx;
  this._engine = new Engine();
  this.Embeddeds = Embeddeds;

  this._embedded = new Embeddeds.Embedded();

  this.registerEmbedded('script',     new Embeddeds.Javascript());
  this.registerEmbedded('javascript', new Embeddeds.Javascript({typeAttribute: true}));
  this.registerEmbedded('css',        new Embeddeds.CSS());

  var filters = this._defaultFilters();
  for (var i = 0, f; f = filters[i]; i++) {
    this._engine.use(f);
  }
}

Template.prototype._defaultFilters = function() {
  return [
    new Parser(),
    this._embedded,
    new Interpolate(),
    new Brackets(),
    new Controls(),
    new AttrMerge(),
    new CodeAttributes(),
    new AttrRemove(),
    new FastHtml(),
    new Escape(),
    new ControlFlow(),
    new MultiFlattener(),
    new StaticMerger(),
    new StringGenerator()
  ];
};

Template.prototype.registerEmbedded = function(name, engine) {
  this._embedded.register(name, engine);
};

Template.prototype.registerEmbeddedFunction = function(name, renderer) {
  var engine = new this.Embeddeds.InterpolateEngine(renderer);
  this.registerEmbedded(name, engine);
};

Template.prototype.eval = function(src, model, options, ctx) {
  ctx = ctx || new this.Ctx();

  ctx._content = ctx.content.bind(ctx);
  ctx._extend = ctx.extend.bind(ctx);
  ctx._partial = ctx.partial.bind(ctx);
  var rt = Runtime;
  ctx.rt = rt;

  var fn = eval(this.src(src, options))[0];

  return fn.call(model, ctx);
};

Template.prototype.exec = function(src, options, ctx) {
  ctx = ctx || new this.Ctx();

  /*jshint unused:false */
  var content = ctx.content.bind(ctx);
  var extend = ctx.extend.bind(ctx);
  var partial = ctx.partial.bind(ctx);
  var rt = Runtime;

  /*jshint unused:true */

  return eval(this.src(src, options))[0];
};

Template.prototype.src = function(src, compileOptions) {
  return [
    '[function(c) {',
    'c.m = this;',
    'var sp = c.stack.length, content = c._content, extend = c._extend, partial = c._partial;',
    this._engine.exec(src, compileOptions),
    'c.res=_b;return c.pop(sp);}]'
  ].join('');
};

Template.prototype.compile = function(src, compileOptions) {
  compileOptions = compileOptions || {};

  var ctx = new this.Ctx();
  if (compileOptions.useCache !== undefined && !compileOptions.useCache) {
    ctx._load = ctx._loadWithoutCache;
  }

  ctx.template = this;
  ctx.basePath = compileOptions.basePath;
  ctx.filename = compileOptions.filename;

  ctx._content = ctx.content.bind(ctx);
  ctx._extend = ctx.extend.bind(ctx);
  ctx._partial = ctx.partial.bind(ctx);
  ctx.rt = Runtime;

  var fn = eval(this.src(src, compileOptions))[0];

  var fnWrap = function(context, runtimeOptions) {
    var res = fn.call(context, ctx);
    ctx.reset();
    return res;
  };
  return fnWrap;
};

module.exports = Template;

},{"./engine":4,"./filters/attr_merge":7,"./filters/attr_remove":8,"./filters/brackets":9,"./filters/code_attributes":10,"./filters/control_flow":11,"./filters/controls":12,"./filters/embedded":13,"./filters/escape":14,"./filters/interpolate":15,"./filters/multi_flattener":16,"./filters/static_merger":18,"./generators/string":20,"./html/fast":21,"./parser":23,"./runtime":24}]},{},[5])