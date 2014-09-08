var gulp = require('gulp');
var stylus = require('gulp-stylus');
var jade = require('gulp-jade');
var nib = require('nib');
var tpl2mod = require('gulp-tpl2mod');
var uglify = require('gulp-uglify');

process.on("uncaughtException", function(err){
  console.log(err);
});

gulp.task('stylus', function(){

  return gulp.src([__dirname + '/public/stylus/*.styl'])
    .pipe(stylus({
      "use": nib(),
      "import": "nib"
    }))
    .on("error",console.log)
    .pipe(gulp.dest(__dirname + '/public/css'));

});

gulp.task('tpl2mod', function(){

  return gulp.src([__dirname + '/public/pages/tpl/*.jade'])
    .pipe(jade())
    .pipe(tpl2mod({
      prefix : "module.exports = "
    }))
    .pipe(gulp.dest(__dirname + '/public/pages/tpl/'));

});

gulp.task('uglify', function(){
  return gulp.src([__dirname + '/public/bundle/pages/*.js'])
    .pipe(uglify()).on("Error",console.log)
    .pipe(gulp.dest(__dirname + '/public/dest/pages'));
});

gulp.task('watch',function(){
  gulp.watch([__dirname + '/public/stylus/*.styl'],['stylus']);
  gulp.watch([__dirname + '/public/pages/tpl/*.jade'],['tpl2mod']);

});

gulp.task('default',['stylus','tpl2mod','watch']);