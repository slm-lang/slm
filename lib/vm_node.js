var VM = require('./vm');
var Path = require('path');
var FS = require('fs');
var nodeVM = require('vm');

function VMNode() {}

var VMProto = VMNode.prototype = new VM();

VMProto._loadWithoutCache = function(path) {
  var src = FS.readFileSync(path, 'utf8');
  return this.runInContext(this.template.src(src, {}), this.filename)[0];
};

VMProto.runInContext = nodeVM.runInThisContext;

VMProto._resolvePath = function(path) {
  var dirname  = Path.dirname,
      basename = Path.basename,
      join = Path.join;

  if (path[0] !== '/' && !this.filename) {
    throw new Error('the "filename" option is required to use with "relative" paths');
  }

  if (path[0] === '/' && !this.basePath) {
    throw new Error('the "basePath" option is required to use with "absolute" paths');
  }

  path = join(path[0] === '/' ? this.basePath : dirname(this.filename), path);

  if (basename(path).indexOf('.') === -1) {
    path += '.slm';
  }

  return path;
};

module.exports = VMNode;
