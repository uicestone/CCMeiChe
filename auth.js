var User = require('./model').user;
var vcode = require('./model/vcode');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
  usernameField: "phone",
  passwordField: "code",
  passReqToCallback : true
}, function (req, phone, code, done) {

  var openid = req.body.openid;
  var access_token = req.body.access_token;
  if(!process.env.DEBUG && (!openid || !access_token)){
    return done({
      status: 400,
      message: "无效请求"
    });
  }

  vcode.verify({
    code: code,
    key: phone
  }, function (err, match) {
    if (err) {
      return done(err);
    }
    if (!match) {
      return done({
        message: "not match",
        status: 400
      });
    } else {
      var user = {
        phone: phone,
        access_token: access_token,
        openid: openid
      };
      User.update({
        phone: user.phone
      }, user, {
        upsert: true
      }, function(err){
        if(err){return done(err);}
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
