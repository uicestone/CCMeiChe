var Service = require("../model/service");

module.exports = function(req,res,next){
  Service.find({haspromo:true}).toArray(function(err,results){
    if(err){
      return next(err);
    }
    res.render("promos",{
      user: req.user,
      id:"promos",
      choices:results
    });
  });
}