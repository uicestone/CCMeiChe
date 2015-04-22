var MonthPackage = require("../model/monthpackage");

module.exports = function(req, res){
  MonthPackage.find({}).sort({
    price:1
  }).toArray(function(err,choices){
    if(err){
      return next(err);
    }

    res.render("month_package",{
      id:"recharge",
      subtitle:"包月",
      choices: choices
    });
  });
};