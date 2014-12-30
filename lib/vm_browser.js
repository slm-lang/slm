var VM = require('./vm');

function VMBrowser() {}

var VMProto = VMBrowser.prototype = new VM();

VMProto._loadWithoutCache = function(path) {
};

VMProto._load = CtxProto._loadWithCache;

VMProto._resolvePath = function(path) {
};

module.exports = VMBrowser;
