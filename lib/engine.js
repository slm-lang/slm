function Engine() {
  this._chain = [];
}

var p = Engine.prototype;

p.use = function(filter) {
  this._chain.push(filter);
};

p.exec = function(src, options) {
  var res = src;
  for (var i = 0, li = this._chain.length; i < li; i++) {
    res = this._chain[i].exec(res, options);
  }

  return res;
};

module.exports = Engine;
