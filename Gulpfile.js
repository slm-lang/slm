var gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    uglify = require('gulp-uglify'),
    gzip = require('gulp-gzip'),
    size = require('gulp-size'),
    concat = require('gulp-concat');

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
  gulp.src('lib/template.js')
  .pipe(browserify())
  .pipe(concat('slm.js'))
  .pipe(size({showFiles: true}))
  .pipe(gulp.dest('dist'))
  .pipe(uglify())
  .pipe(concat('slm.min.js'))
  .pipe(size({showFiles: true}))
  .pipe(gulp.dest('dist'))
  .pipe(gzip())
  .pipe(size({showFiles: true}))
  .pipe(gulp.dest('dist'))
});

gulp.task('runtime', function() {
  gulp.src('lib/runtime.js')
  .pipe(browserify())
  .pipe(concat('slm-runtime.js'))
  .pipe(size({showFiles: true}))
  .pipe(gulp.dest('dist'))
  .pipe(uglify())
  .pipe(concat('slm-runtime.min.js'))
  .pipe(size({showFiles: true}))
  .pipe(gulp.dest('dist'))
  .pipe(gzip())
  .pipe(size({showFiles: true}))
  .pipe(gulp.dest('dist'))
});
