var gulp = require('gulp');
var stylus = require('gulp-stylus');
var jade = require('gulp-jade');
var nib = require('nib');

gulp.task('stylus', function(){

  return gulp.src(['public/stylus/*.styl'])
    .pipe(stylus({
      "use": nib(),
      "import": "nib"
    }))
    .pipe(gulp.dest('public/css'));

});

gulp.task('watch',function(){

  gulp.watch(['public/stylus/*.styl'],['stylus']);

});

gulp.task('default',['stylus']);