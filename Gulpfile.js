var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('default', ['test']);

gulp.task('test', function(cb) {
  var spawn = require('child_process').spawn;
  var child = spawn('node_modules/.bin/lab', ['-v', '-t', 94], {stdio: 'inherit'});
  child.on('exit', function(code) {
    cb(code ? new Error('Tests Failed') : null);
  });
});

gulp.task('build', ['browser', 'vm']);

gulp.task('browser', function() {
  var vars = [], varsMap = {};

  var replacePrivate = function(name) {
    var map = varsMap[name];
    if (!map) {
      vars.push(name);
      map = '._' + vars.length.toString(32);
      varsMap[name] = map;
      // console.log(vars.length, map, name);
    }

    return map;
  };

  gulp.src('lib/slm_browser.js')
  .pipe($.webpack({
      output: {
        filename: 'slm-browser.js',
        library: 'Slm',
        libraryTarget: 'umd'
      }
  }))
  .pipe($.size({showFiles: true}))
  .pipe(gulp.dest('dist'))
  .pipe($.replace( /\._(\w+)/g, replacePrivate))
  .pipe($.uglify())
  .pipe($.concat('slm-browser.min.js'))
  .pipe($.size({showFiles: true}))
  .pipe(gulp.dest('dist'))
  .pipe($.gzip())
  .pipe($.size({showFiles: true}))
  .pipe(gulp.dest('dist'));
});

gulp.task('vm', function() {
  var vars = [];
  var varsMap = {};

  var replacePrivate = function(name) {
    var map = varsMap[name];
    if (!map) {
      vars.push(name);
      map = varsMap[name] = '._' + vars.length.toString(32);
    }

    return map;
  };

  gulp.src('lib/vm_browser.js')
  .pipe($.webpack({
      output: {
        filename: 'slm-vm-browser.js',
        library: 'SlmVM',
        libraryTarget: 'umd'
      }
  }))
  .pipe($.size({showFiles: true}))
  .pipe(gulp.dest('dist'))
  .pipe($.replace( /\._(\w+)/g, replacePrivate))
  .pipe($.uglify())
  .pipe($.concat('slm-vm-browser.min.js'))
  .pipe($.size({showFiles: true}))
  .pipe(gulp.dest('dist'))
  .pipe($.gzip())
  .pipe($.size({showFiles: true}))
  .pipe(gulp.dest('dist'));
});
