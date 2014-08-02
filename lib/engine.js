function Engine() {
  this._chain = [];
}

var EngineProto = Engine.prototype;

EngineProto.use = function(filter) {
  this._chain.push(filter);
}

EngineProto.exec = function(src, options) {
  var res = src;
  for (var i = 0, f; f = this._chain[i]; i++) {
    res = f.exec(res, options);
  }

  return res;
}

module.exports = Engine;
