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
        if(userpromo){
          userpromo.amount += promo.amount;
        }else{
          promo.amount = promo.amount;
          userpromos.push(promo);
        }
      });

      User.updateById(id, {
        $inc:{
          credit: recharge.credit
        },
        $set: {
          promo: recharge.promo
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
  findByPhone: function(phone, callback){
    User.findOne({
      phone: phone
    }, callback);
  },
  addCar: function(phone, car, callback){
    User.update({
      phone: phone
    }, {
      $addToSet: {
        cars: car
      }
    }, callback);
  },
  modifyCar: function(phone, index, data, callback){
    var updateDoc = {};
    if(!index){
      return callback(null);
    }
    User.findByPhone(phone, function(err, user){
      if(err || !user){
        return callback(err);
      }
      updateDoc["cars." + index] = _.extend(user.cars[index], data);
      User.update({
        phone: phone
      }, {
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
  modifyAddress: function(phone, index, data, callback){
    var updateDoc = {};
    updateDoc["addresses." + index] = data;
    User.update({
      phone: phone
    }, {
      $set: updateDoc
    }, callback);
  },
  addAddress: function(phone, data, callback){
    User.findOne({
      phone: phone,
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

      User.update({
        phone: phone
      }, {
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
  updateDefaultCars: function(phone, cars, callback){
    User.findByPhone(phone, function(err, user){
      if(err){
        return callback(err);
      }
      user.cars = user.cars.map(function(car){
        car["default"] = cars.some(function(postCar){
          return postCar.number == car.number;
        });
        return car;
      });
      User.update({
        phone: phone
      },{
        $set:{
          cars: user.cars
        }
      }, callback);
    });
  }
});