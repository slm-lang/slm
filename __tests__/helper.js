var VM = require('../lib/vm');

exports.assertHtml = function(template, src, result, options) {

  if (Array.isArray(src)) {
    src = src.join('\n');
  }

  var env = {};
  var context = {
    items: [1,2,3],
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
      }
      return [m1, m2].join(' ');
    },
    helloBlock: function(callback) {
      return this.helloWorld + ' ' + callback() + ' ' + this.helloWorld;
    },
    block: function(callback) {
      return VM.safe(callback());
    },
    content: function() {
      switch (arguments.length) {
        case 0:
          return env[''];
        case 1:
          return env[arguments[0]];
        case 2:
          var arg = arguments[0];
          if (!arg) {
            return arguments[1]();
          }
          return env[arg] || arguments[1]();
      }
    },
    evilMethod: function() {
      return '<script>do_something_evil();</script>';
    }
  };
  expect(template.render(src, context, options)).toEqual(result);
};

exports.assertSyntaxError = function(template, src, result, options) {
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
    message: function(v){ return v; },
    helloBlock: function(callback) {
      return this.helloWorld + ' ' + callback() + ' ' + this.helloWorld;
    }
  };
  expect(function() {
    template.render(src, context, options);
  }).toThrowError(result);
};
