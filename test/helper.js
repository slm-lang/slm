var Lab = require('lab')
var assert  = Lab.assert

exports.assertHtml = function(template, src, result, options, callback) {
  src = src.join('\n');
  var context = {
    idHelper: 'notice',
    outputNumber: 1337,
    helloWorld: 'Hello World from @env',
    showFirst: function(force) {
      if (force !== undefined) {
        return force;
      }
      return false;
    },
    x: 0,
    message: function(m1, m2){
      if (!m2) {
        return m1;
      } else {
        return [m1, m2].join(' ')
      }
    },
    helloBlock: function(callback) {
      return this.helloWorld + ' ' + callback() + ' ' + this.helloWorld;
    },
    evilMethod: function() {
      return '<script>do_something_evil();</script>';
    }
  };
  assert.deepEqual(template.eval(src, context, options), result);
  if (callback) {
    callback();
  }
}

exports.assertSyntaxError = function(template, src, result, options, callback) {
  src = src.join('\n');
  var context = {
    idHelper: 'notice',
    outputNumber: 1337,
    helloWorld: 'Hello World from @env',
    showFirst: function(force) {
      if (force !== undefined) {
        return force;
      }
      return false;
    },
    x: 0,
    message: function(v){return v},
    helloBlock: function(callback) {
      return this.helloWorld + ' ' + callback() + ' ' + this.helloWorld;
    }
  };
  assert.throw(function() {
    template.eval(src, context, options);
  }, result);

  if (callback) {
    callback();
  }

}
