var jwt = require('jwt-simple');
var config = require('config');


module.exports = function(req,res,next){
  function deny(){
    res.status(401).send("Unauthorized");
  }
  if(req.isAuthenticated()){
    next();
  }else{
    var auth_header = req.headers['Authorization'];
    var token = auth_header.split("Bearer ")[1];
    if(!token){return deny()}
    try{
      var user = jwt.decode(token, config.jwt_secret);
    }catch(e){
      return deny();
    }
    if(user){
      req.user = user;
      next();
    }else{
      deny();
    }
  }
}