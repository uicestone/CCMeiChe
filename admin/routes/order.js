var _ = require('underscore');
module.exports = function(req,res,next){
  if(!req.isAuthenticated()){
    return res.redirect('/login')
  }

  res.render('order',{
    user: req.user,
    title: "订单查询"
  });

}