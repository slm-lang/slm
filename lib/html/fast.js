function Fast(options) {

  this.format = 'xhtml';
  this.attrQuote = '"';
  this.autoclose  = 'base basefont bgsound link meta area br embed img keygen wbr input menuitem param source track hr col frame'.split(/\s/);
  this.jsWrapper = 'guess';

  this.HTML = ['html', 'html4', 'html5'];

  if (this.jsWrapper == 'guess') {
    if (this.format == 'xhtml') {
      this.jsWrapper = 'cdata';
    } else {
      this.jsWrapper = 'comment';
    }
  }

  switch(this.jsWrapper) {
    case 'comment':
      this.jsWrapper = [ "<!--\n", "\n//-->" ];
      break;
    case 'cdata':
      this.jsWrapper = [ "\n//<![CDATA[\n", "\n//]]>\n" ];
      break;
    case 'both':
      this.jsWrapper = [ "<!--\n//<![CDATA[\n", "\n//]]>\n//-->" ];
  }
};

var Html = require('./html');
Fast.prototype = new Html;

(function() {
  this.on_html_doctype = function(type) {

    var XHTML_DOCTYPES = {
      '1.1'          : '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
      '5'            : '<!DOCTYPE html>',
      'html'         : '<!DOCTYPE html>',
      'strict'       : '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
      'frameset'     : '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">',
      'mobile'       : '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">',
      'basic'        : '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">',
      'transitional' : '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
      'svg'          : '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">'
    }

    var HTML_DOCTYPES = {
      '5'            : '<!DOCTYPE html>',
      'html'         : '<!DOCTYPE html>',
      'strict'       : '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">',
      'frameset'     : '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN" "http://www.w3.org/TR/html4/frameset.dtd">',
      'transitional' : '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">',
    }

    type = type.toString().toLowerCase();
    var m, str;

    if (m = /^xml(\s+(.+))?$/.exec(type)) {
      if (this.format !== 'xhtml') {
        throw new Error('Invalid xml directive in html mode');
      }
      var w = this.attrQuote;
      str = "<?xml version=" + w + "1.0" + w + " encoding=" + w + (m[2] || 'utf-8') + w + " ?>";
    } else if (this.format !== 'xhtml') {
      str = HTML_DOCTYPES[type];
      if (!str) {
        throw new Error("Invalid html doctype " + type);
      }
    } else {
      str = XHTML_DOCTYPES[type];
      if (!str) {
        throw new Error("Invalid xhtml doctype " + type);
      }
    }

    return ['static', str];
  };

  this.on_html_comment = function(content) {
    return ['multi',
      ['static', '<!--'],
      this.compile(content[0]),
      ['static', '-->']];
  };

  this.on_html_condcomment = function(condition, content) {
    return this.on_html_comment(['multi',
                     ['static', "[" + condition + "]>"],
                     content,
                     ['static', '<![endif]']]);
  };

  this.on_html_tag = function(name, attrs, content, exps) {
    name = name.toString();
    var closed = !content || (this.isEmptyExp(content) && this.autoclose.indexOf(name) >= 0);
    var result = ['multi', ['static', '<' + name], this.compile(attrs)];
    result.push(['static', (closed && this.format == 'xhtml' ? ' /' : '') + '>']);
    if (content) {
      result.push(this.compile(content));
    }
    if (!closed) {
      result.push(['static', "</" + name + ">"]);
    }
    return result;
  };

  this.on_html_attrs = function(attrs) {
    var len = attrs.length;
    var res = ['multi'];
    for (var i = 0; i < len; i++) {
      res.push(this.compile(attrs[i]));
    }
    return res;
  };

  this.on_html_attr = function(name, value) {
    if (this.format != 'xhtml' && this.isEmptyExp(value[0])) {
      return ['static', " " + name];
    } else {
      return ['multi',
       ['static', " " + name + "=" + this.attrQuote],
       this.compile(value[0]),
       ['static', this.attrQuote]]
    }
  };

  this.on_html_js = function(content) {
    if (this.jsWrapper) {
      return ['multi',
       ['static', this.jsWrapper[0]],
       this.compile(content[0]),
       ['static', this.jsWrapper[1]]]
    } else {
      this.compile(content)
    }
  };


}).apply(Fast.prototype);

module.exports = Fast;
