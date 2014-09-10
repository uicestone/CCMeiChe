module.exports = function(req,res){
  if(!req.isAuthenticated()){
    return res.redirect('/login')
  }

  res.render('home');

}