var User = require('./model').user;
var vcode = require('./model/vcode');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
  usernameField: "phone",
  passwordField: "code"
}, function (phone, code, done) {
  vcode.verify({
    code: code,
    key: phone
  }, function (err, match) {
    if (err) {
      return done(err);
    }
    if (!match) {
      return done(null, null);
    } else {
      var user = {phone:phone};
      User.update(user,user,{
        upsert: true
      }, function(){
        console.log(arguments);
        done(null,user);
      });
    }
  });
}));

passport.serializeUser(function (user, done) {
  done(null, user.phone);
});

passport.deserializeUser(function (phone, done) {
  User.findOne({
    phone: phone
  }, done);
});
