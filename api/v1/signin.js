var models = require("../../model");
var vcode = models.vcode;
var User = models.user;
var passport = require('passport');
var jwt = require('jwt-simple');
var config = require('config');

exports.post = [
  passport.authenticate('local'),
  function (req, res, next) {
    var token = jwt.encode(req.user, config.jwt_secret);
    res.send({
      token: token
    });
  }
];