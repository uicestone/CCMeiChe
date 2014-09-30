var Service = require('../model/service');

module.exports = function(req,res){
  Service.find().sort({
    _id: 1
  }).toArray(function(err, services){
    res.render('services',{
      id:"recharge",
      user: req.user,
      services: services
    });
  });
}