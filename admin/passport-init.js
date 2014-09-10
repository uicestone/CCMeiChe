var md5 = require('MD5');
var Admin = require('../model').admin;
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(Admin.validate));


passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(_id, done){
  Admin.findById(_id, done);
});