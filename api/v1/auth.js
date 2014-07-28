module.exports = function(req,res,next){
  if(req.session){
    next();
  }else{
    req.send(403,"access denided");
  }
}