var User = require('../../model').user;
var Order = require('../../model').order;
var async = require('async');
var _ = require('underscore');


module.exports = function(req,res,next){
  async.waterfall([

    function(done){
      User.find().toArray(done);
    },
    function(users, done){
      async.map(users, function(user, done){
        Order.find({
          "user._id": user._id,
          "status": "done"
        }).toArray(function(err, orders){
          if(err){done(err);}

          user.order_count = orders.length;
          user.order_price_count = orders.map(function(item){
            return item.price;
          }).reduce(function(a,b){
            return a + b;
          },0);
          done(null, _.pick(user,'_id','wechat_info','phone','order_count','order_price_count'));
        });
      }, done);
    }
  ], function(err, users){
    if(err){
      return next(err);
    }
    res.send({
      data: users
    });
  });


}