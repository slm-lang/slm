var VM = require('./vm');

function VMBrowser() { VM.call(this); }

var p = VMBrowser.prototype = new VM();

p.runInContext = function(src, filename) {
  if (filename) {
    src += '\n//# sourceURL=' + filename;
  }
  return eval(src);
};

p._resolvePath = function() {};

module.exports = VMBrowser;
