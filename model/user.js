var Model = require('./base');
var User =  Model("user");
var RechargeOrder = Model
var _ = require('underscore');
var db = require("../db");

module.exports = User;

db.bind('user',{
  // 充值
  recharge: function(id, recharge, callback){
    User.findById(id, function(err, user){
      if(err){
        return callback(err);
      }

      var userpromos = user.promo || [];
      recharge.promo.forEach(function(promo){
        var userpromo = userpromos.filter(function(item){
          return item._id == promo._id;
        })[0];

        // 用户有该优惠券
        if(userpromo){
          userpromo.amount += promo.amount;
        // 用户没有该优惠券
        }else{
          userpromos.push(promo);
        }
      });

      User.updateById(id, {
        $inc:{
          credit: recharge.credit
        },
        $set: {
          promo: userpromos
        }
      }, callback);
    });
  },
  // 确认订单扣除优惠券积分
  charge: function(id, order, callback){
    User.findById(id, function(err, user){
      var userpromo = user.promo || [];
      userpromo = userpromo.map(function(promo){
        if(promo._id == order.service._id && promo.amount > 0){
          promo.amount -= 1;
        }
        return promo
      });
      User.updateById(id, {
        $inc:{
          credit: -order.credit
        },
        $set: {
          promo: userpromo
        }
      }, callback);
    });
  },
  findByOpenId: function(openid, callback){
    User.findOne({
      openid: openid
    }, callback);
  },
  addCar: function(id, car, callback){
    User.updateById(id, {
      $addToSet: {
        cars: car
      }
    }, callback);
  },
  modifyCar: function(id, index, data, callback){
    var updateDoc = {};
    if(!index){
      return callback(null);
    }
    console.log("id",id);
    User.findById(id, function(err, user){
      if(err || !user){
        return callback(err);
      }
      updateDoc["cars." + index] = _.extend(user.cars[index], data);
      User.updateById(id, {
        $set: updateDoc
      }, callback);
    });
  },
  updateCarPic: function(id, cars, callback){
    User.findById(id, function(err, user){
      if(err){
        return callback(err);
      }
      var updateDoc = {};
      cars.forEach(function(car){
        var index = user.cars.map(function(car){
          return car.number;
        }).indexOf(car.number);
        console.log(index, cars);
        if(!user.cars[index].pic && cars[index].pics.length){
          updateDoc["cars." + index] = _.extend(user.cars[index], {
            pic: cars[index].pics[0]
          });
        }
      });

      console.log(updateDoc);
      User.updateById(id,{
        $set: updateDoc
      }, callback);
    });
  },
  modifyAddress: function(id, index, data, callback){
    var updateDoc = {};
    updateDoc["addresses." + index] = data;
    User.updateById(id, {
      $set: updateDoc
    }, callback);
  },
  addAddress: function(id, data, callback){
    User.findOne({
      _id: id,
      "addresses.address": data.address,
      "addresses.carpark": data.carpark
    },function(err, user){
      if(err){
        return callback(err);
      }

      if(user){
        var error = new Error();
        error.name = "EEXISTS";
        return callback(error);
      }

      User.updateById(id, {
        $addToSet: {
          addresses : {
            address: data.address,
            latlng: data.latlng,
            carpark: data.carpark
          }
        }
      }, callback);
    });
  },
  updateDefaultCars: function(id, cars, callback){
    User.findById(id, function(err, user){
      if(err){
        return callback(err);
      }
      user.cars = user.cars.map(function(car){
        car["default"] = cars.some(function(postCar){
          return postCar.number == car.number;
        });
        return car;
      });
      User.updateById(id, {
        $set:{
          cars: user.cars
        }
      }, callback);
    });
  }
});