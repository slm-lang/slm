var VM = require('./vm');

function VMBrowser() { VM.call(this); }

var VMProto = VMBrowser.prototype = new VM();

VMProto.runInContext = function(src, filename) {
  if (filename) {
    src += '\n//# sourceURL=' + filename;
  }
  return eval(src);
};

VMProto._resolvePath = function() {};

module.exports = VMBrowser;
