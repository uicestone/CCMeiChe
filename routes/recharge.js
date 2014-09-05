var Recharge = require("../model/recharge");

module.exports = function(req,res,next){
  Recharge.find().toArray(function(err,results){
    if(err){
      return next(err);
    }
    console.log(results);
    res.render("recharge",{
      id:"recharge",
      choices:results
    });
  });
}