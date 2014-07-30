var models = require("../../model");
var vcode = models.vcode;
var User = models.user;
var passport = require('passport');

exports.post = [
  passport.authenticate('local'),
  function (req, res, next) {
    console.log(req.user);
    res.send("success");
  }
];