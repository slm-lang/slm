function Engine() {
  this.chain = [];
}

var EngineProto = Engine.prototype;

EngineProto.use = function(filter) {
  this.chain.push(filter);
}

EngineProto.exec = function(src, options) {
  var res = src;
  for (var i = 0, f; f = this.chain[i]; i++) {
    res = f.exec(res, options);
  }

  return res;
}

module.exports = Engine;
