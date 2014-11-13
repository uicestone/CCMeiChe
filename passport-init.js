var User = require('./model').user;
var Worker = require("./model").worker;
var vcode = require('./model/vcode');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var logger = require('./logger');

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
        message: "验证码不正确或已失效",
        status: 400
      });
    } else {
      var user = {
        phone: phone,
        access_token: access_token,
        openid: openid
      };
      User.findOne({
        phone: phone
      }, function(err, existsUser){
        if(err){
          return done(err);
        }
        
        if(!existsUser){
          console.log("新用户充20积分");
          user.credit = 20;
        }

        User.update({
          phone: user.phone
        }, {
          $set: user
        }, {
          upsert: true
        }, function(err){
          if(err){return done(err);}
          User.findOne({
            phone: phone
          }, function(err, user){
            if(err){return done(err);}
            logger.log('[登录]', user.phone);
            done(null, user);
          });
        });

      });
    }
  });


}));


if(process.env.SERVICE == "worker"){
  passport.serializeUser(function (user, done) {
    done(null, user.openid);
  });

  passport.deserializeUser(Worker.findByOpenId);
}else{
  passport.serializeUser(function (user, done) {
    done(null, user._id.toString());
  });

  passport.deserializeUser(User.findById.bind(User));
}