var Order = require('../../model').order;
var _ = require('underscore');
module.exports = function(req,res,next){
  Order.find().toArray(function(err, orders){
    if(err){
      return next(err);
    }

    orders = orders.map(function(order){
      order.worker = _.pick(order.worker, 'name');
      order.user = _.pick(order.user,'wechat_info');
      order = _.omit(order,'cancelled_former_order');
      return order;
    });
    res.send({
      data: orders
    });
  });
}