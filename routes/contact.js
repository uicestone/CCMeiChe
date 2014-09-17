module.exports = function(req,res){

  res.render('contact',{
    id:"contact",
    user: req.user
  });
}