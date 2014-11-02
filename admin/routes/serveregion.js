var Region = require("../../model/serveregion");
module.exports = function(req,res,next){

  Region.find().toArray(function(err,regions){
    if(err){return next(err);}

    res.render("serveregion",{
    	user: req.user,
      title: "服务范围",
      regions: regions
    });
  });
}