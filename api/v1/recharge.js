var User = require("../../model/user");
var Recharge = require("../../model/recharge");
var RechargeOrder = require("../../model/rechargeorder");
var wechat_user = require("../../util/wechat").user;
var logger = require('../../logger');
var _ = require("underscore");

exports.post = function(req,res,next){
  var id = req.params.id;
  Recharge.findById(id,function(err,recharge){
    if(err || !recharge){
      return next(err);
    }

    logger.debug("INSERT",recharge);
    RechargeOrder.insert({
      recharge: +(+recharge).toFixed(2),
      user: _.pick(req.user,"_id","phone")
    }, function(err, orders){
      if(err){
        return next(err);
      }
      var order = orders[0];
      wechat_user.pay_request(req, {
        id: order._id,
        price: order.recharge.price,
        name: order.recharge.title,
        attach: {
          type: "recharge"
        }
      },function(err,payment_args){
        if(err){return next(err);}
        res.status(200).send({
          orderId: order._id,
          payment_args:payment_args
        });
      });
    });
  });
}