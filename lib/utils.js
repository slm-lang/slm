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

  if (escapeRe.test(str) ) {
    if( str.indexOf('&') != -1 ) str = str.replace(ampRe, '&amp;');
    if( str.indexOf('<') != -1 ) str = str.replace(ltRe, '&lt;');
    if( str.indexOf('>') != -1 ) str = str.replace(gtRe, '&gt;');
    if( str.indexOf('"') != -1 ) str = str.replace(quotRe, '&quot;');
  }

  return str;
}

function rejectEmpty(arr) {
  var res = [];

  for (var i = 0; i < arr.length; i++) {
    var el = arr[i];
    if (el != null && el.length > 0) {
      res.push(el);
    }
  }

  return res;
}

function flatten1(arr) {
  return arr.reduce(function (acc, val) {
    return acc.concat(val.constructor === Array ? flatten(val) : val.toString());
  }, []);
}

function flatten2(arr) {
  return _flatten(arr, []);
}

function _flatten(arr, res) {
  for (var i = 0; i < arr.length; i++) {
    var el = arr[i];
    if (el instanceof Array) {
      _flatten(el, res);
    } else {
      res.push(el.toString());
    }
  }
  return res;
}

module.exports = {
  safe: safe,
  escape: escape,
  rejectEmpty: rejectEmpty,
  flatten: flatten2
}
