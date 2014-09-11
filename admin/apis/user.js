var User = require('../../model').user;
module.exports = function(req,res,next){
  User.find().toArray(function(err, users){
    if(err){
      return next(err);
    }
    res.send({
      data: users
    });
  });
}