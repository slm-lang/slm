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

  return escapeRe.test(str)
    ? str.replace(ampRe, '&amp;').replace(quotRe, '&quot;').replace(ltRe, '&lt;').replace(gtRe, '&gt;')
    : str;
}

module.exports = {
  safe: safe,
  escape: escape
}
