var User = require("../../model/user");
var Recharge = require("../../model/recharge");
var RechargeOrder = require("../../model/rechargeorder");
var wechat_user = require("../../util/wechat").user;

exports.post = function(req,res,next){
  var price = +req.params.price;
  Recharge.findOne({
    price: price
  },function(err,recharge){
    if(err || !recharge){
      return next(err);
    }

    RechargeOrder.insert({
      recharge: recharge,
      user: req.user
    }, function(err, orders){
      if(err){
        return next(err);
      }
      var order = orders[0];
      var payment_args = wechat_user.pay_request(req, {
        id: order._id,
        price: order.recharge.price,
        name: order.recharge.title,
        attach: {
          type: "recharge"
        }
      });

      res.status(200).send({
        orderId: order._id,
        payment_args:payment_args,
      });

    });


  });
}