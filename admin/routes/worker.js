var _ = require('underscore');
module.exports = function(req,res,next){
  res.render('worker',{
    user: req.user,
    title: "车工管理"
  });
}