var _ = require('underscore');
module.exports = function(req,res,next){
  if(!req.isAuthenticated()){
    return res.redirect('/login')
  }

  res.render('user',{
    user: req.user,
    title: "用户查询"
  });

}