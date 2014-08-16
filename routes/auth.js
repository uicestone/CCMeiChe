module.exports = function(req,res,next){
  if(!req.isAuthenticated()){
    if(process.env.DEBUG){
      return res.redirect("/login");
    }else{
      var url = oauth.getAuthorizeURL(config.host.user + '/login');
      return res.redirect(url);
    }
  }


  res.locals.user = req.user;
  next();
}