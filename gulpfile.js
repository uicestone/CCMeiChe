var gulp = require('gulp');
var stylus = require('gulp-stylus');
var jade = require('gulp-jade');
var nib = require('nib');
var tpl2mod = require('gulp-tpl2mod');

process.on("uncaughtException", function(err){
  console.log(err);
});

gulp.task('stylus', function(){

  return gulp.src(['public/stylus/*.styl'])
    .pipe(stylus({
      "use": nib(),
      "import": "nib"
    }))
    .pipe(gulp.dest('public/css'));

});

gulp.task('tpl2mod', function(){

  return gulp.src([__dirname + '/public/pages/tpl/*.jade'])
    .pipe(jade())
    .pipe(tpl2mod({
      prefix : "module.exports = "
    }))
    .pipe(gulp.dest(__dirname + '/public/pages/tpl/'));

});

gulp.task('watch',function(){

  gulp.watch(['public/stylus/*.styl'],['stylus']);
  gulp.watch(['public/pages/tpl/*.jade'],['tpl2mod']);

});

gulp.task('default',['stylus','tpl2mod','watch']);