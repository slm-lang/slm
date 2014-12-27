var gulp = require('gulp');
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
var gzip = require('gulp-gzip');
var size = require('gulp-size');
var replace = require('gulp-replace');
var concat = require('gulp-concat');

gulp.task('default', ['test']);

gulp.task('test', function(cb) {
  var spawn = require('child_process').spawn;
  var child = spawn('node_modules/.bin/lab', ['-v', '-t', 90], {stdio: 'inherit'});
  child.on('exit', function(code) {
    cb(code ? new Error('Tests Failed') : null);
  });
});

gulp.task('build', ['full', 'runtime']);

gulp.task('full', function() {
  var vars = [];
  var varsMap = {};

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

  gulp.src('lib/slm.js')
  .pipe(browserify())
  .pipe(concat('slm.js'))
  .pipe(size({showFiles: true}))
  .pipe(gulp.dest('dist'))
  .pipe(replace( /\._(\w+)/g, replacePrivate))
  .pipe(uglify())
  .pipe(concat('slm.min.js'))
  .pipe(size({showFiles: true}))
  .pipe(gulp.dest('dist'))
  .pipe(gzip())
  .pipe(size({showFiles: true}))
  .pipe(gulp.dest('dist'));
});

gulp.task('runtime', function() {
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

  gulp.src('lib/runtime.js')
  .pipe(browserify())
  .pipe(concat('slm-runtime.js'))
  .pipe(size({showFiles: true}))
  .pipe(gulp.dest('dist'))
  .pipe(replace( /\._(\w+)/g, replacePrivate))
  .pipe(uglify())
  .pipe(concat('slm-runtime.min.js'))
  .pipe(size({showFiles: true}))
  .pipe(gulp.dest('dist'))
  .pipe(gzip())
  .pipe(size({showFiles: true}))
  .pipe(gulp.dest('dist'));
});
