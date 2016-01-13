var Template = require('./template');
var template = new Template(require('./vm_node'));

var FS = require('fs');

var slm = template.exports();

module.exports = slm;

slm.__express = function(path, options, fn) {
  FS.readFile(path, 'utf-8', function (err, src) {
    if (err) {
      return fn(new Error(err));
    }
    var compile = slm.compile;
    var runtimeOptions = options;
    var compileOptions = {};
    compileOptions.useCache = options.cache;
    compileOptions.basePath = options.views;
    compileOptions.filename = path;

    if (!slm.__cache) {
      slm.__cache = {}
    }

    try {
      var compiled = slm.__cache[path];

      if (compiled && options.cache) {
        return fn(null, compiled(options, compileOptions));
      }

      compiled = compile(src, compileOptions);
      var rendered = compiled(options, compileOptions);
      slm.__cache[path] = compiled;
      fn(null, rendered);
    } catch (e) {
      fn(e, null);
    }
  });
};

