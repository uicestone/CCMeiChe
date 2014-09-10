var path = require('path');
module.exports = function(req,res){
  var redirect = req.query.redirect;
  if(!redirect || redirect == req.url){
    redirect = "/";
  }

  if(req.isAuthenticated()){
    return res.redirect(redirect);
  }

  res.sendfile( path.join(__dirname, '..', 'pages', 'login.html') );
}