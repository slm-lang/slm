function Engine() {
  this.chain = [];
}

(function() {

  this.use = function(filter) {
    this.chain.push(filter);
  };

  this.exec = function(src) {
    var res = src;
    for (var i = 0, f; f = this.chain[i]; i++) {
      res = f.exec(res);
    }

    return res;
  };

}).call(Engine.prototype);

module.exports = Engine;
