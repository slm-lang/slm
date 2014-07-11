function safe(value) {
  if (!value) {
    return value;
  }

  if (value.htmlSafe) {
    return value;
  }

  result = new String(value || '')
  result.htmlSafe = true
  return result;
}

function escape(str) {
  if (!str) {
    return '';
  }

  if (str.htmlSafe || !/[&<>\"]/.test(str)) {
    return str;
  }

  return ('' + str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

module.exports = {
  safe: safe,
  escape: escape
}
