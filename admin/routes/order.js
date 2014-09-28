var _ = require('underscore');
module.exports = function(req,res,next){
  res.render('order',{
    user: req.user,
    title: "订单查询"
  });

}