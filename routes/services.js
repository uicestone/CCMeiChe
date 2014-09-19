module.exports = function(req,res){
  res.render('services',{
    user: req.user
  });
}