module.exports = function(req,res,next){
  if(!req.isAuthenticated()){
    return res.send(403,{
      code: 403,
      message: "denied"
    });
  }else{
    next();
  }
}