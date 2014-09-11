var Order = require('../../model').order;
module.exports = function(req,res,next){
  Order.find().toArray(function(err, orders){
    if(err){
      return next(err);
    }
    res.send({
      data: orders
    });
  });
}