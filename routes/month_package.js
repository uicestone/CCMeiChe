var MonthPackage = require("../model/monthpackage");

module.exports = function(req, res){
  MonthPackage.find({}).sort({
    price:1
  }).toArray(function(err,services){
    if(err){
      return next(err);
    }

    res.render("month_package",{
      id: "home",
      title: "包月",
      user: req.user,
      services: services
    });
  });
};