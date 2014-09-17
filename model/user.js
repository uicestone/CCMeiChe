var Model = require('./base');
var User =  Model("user");
var _ = require('underscore');
var db = require("../db");

module.exports = User;

db.bind('user',{
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