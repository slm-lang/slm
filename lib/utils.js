var escapeRE = /[&<>"]/;
var escapeAmpRE = /&/g;
var escapeLtRE = /</g;
var escapeGtRE = />/g;
var escapeQuotRE = /"/g;

function safe(value) {
  if (!value || value.htmlSafe) {
    return value;
  }

  result = new String(value);
  result.htmlSafe = true
  return result;
}

function escape(str) {
  if (typeof(str) !== 'string') {
    if (!str) {
      return '';
    }
    if (str.htmlSafe) {
      return str;
    }
    str = str.toString();
  }

  if (escapeRE.test(str)) {
    return str.replace(escapeAmpRE, '&amp;').replace(escapeQuotRE, '&quot;').replace(escapeLtRE, '&lt;').replace(escapeGtRE, '&gt;')
  }
  return str;
}

module.exports = {
  safe: safe,
  escape: escape
}
