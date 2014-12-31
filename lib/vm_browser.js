var VM = require('./vm');

function VMBrowser() {}

var VMProto = VMBrowser.prototype = new VM();

VMProto.runInContext = function(src, filename) {
  if (filename) {
    src += '\n//# sourceURL=' + filename;
  }
  return eval(src);
};

VMProto._loadWithoutCache = function(path) {
};

VMProto._load = VMProto._loadWithCache;

VMProto._resolvePath = function(path) {
};

module.exports = VMBrowser;
