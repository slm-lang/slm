var escapeRE = /[&<>"]/;
var escapeAmpRE = /&/g;
var escapeLtRE = /</g;
var escapeGtRE = />/g;
var escapeQuotRE = /"/g;

function safe(val) {
  if (!val || val.htmlSafe) {
    return val;
  }

  var res = new String(val);
  res.htmlSafe = true
  return res;
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

  return escapeRE.test(str)
    ? str.replace(escapeAmpRE, '&amp;').replace(escapeQuotRE, '&quot;').replace(escapeLtRE, '&lt;').replace(escapeGtRE, '&gt;')
    : str;
}

module.exports = {
  safe: safe,
  escape: escape
}
