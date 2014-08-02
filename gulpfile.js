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

gulp.task('jade', function(){

  return gulp.src(['public/jade/*.jade'])
    .pipe(jade())
    .pipe(gulp.dest('public/html'));
});

gulp.task('watch',function(){

  gulp.watch(['public/stylus/*.styl'],['stylus']);
  gulp.watch(['public/jade/*.jade'],['jade']);

});

gulp.task('default',['stylus','jade','watch']);