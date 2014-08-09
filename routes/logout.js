module.exports = function(req,res){
  req.session.destroy(function (err) {
    res.redirect('/');
  });
}