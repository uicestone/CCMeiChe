var _ = require('underscore');
module.exports = function(req,res,next){
  if(!req.isAuthenticated()){
    return res.redirect('/login')
  }

  res.render('worker',{
    user: req.user,
    title: "车工管理"
  });

}