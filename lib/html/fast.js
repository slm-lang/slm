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
