var path = require('path');
module.exports = function(req,res){
  var redirect = req.query.redirect;
  if(!redirect || redirect == req.url){
    redirect = "/";
  }

  if(req.isAuthenticated()){
    return res.redirect(redirect);
  }

  res.render('login', {
    bodyClass: "gray-bg"
  });
}