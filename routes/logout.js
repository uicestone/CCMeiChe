var User = require('../model/user');
module.exports = function(req,res){
  User.updateById(req.user._id, {
    $set:{
      openid: ""
    }
  }, function(){
    req.session.destroy(function (err) {
      res.redirect('/wechat');
    });
  });
}