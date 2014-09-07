var Model = require('./base');
var User =  Model("user");
var db = require("../db");

module.exports = User;

db.bind('user',{
  findByOpenId: function(openid, callback){
    this.findOne({
      openid: openid
    }, callback);
  },
  findByPhone: function(phone, callback){
    this.findOne({
      phone: phone
    }, callback);
  },
  addCar: function(phone, car, callback){
    this.update({
      phone: phone
    }, {
      $addToSet: {
        cars: car
      }
    }, callback);
  },
  updateDefaultCars: function(phone, cars, callback){
    var self = this;
    self.findByPhone(phone, function(err, user){
      if(err){
        return callback(err);
      }
      user.cars = user.cars.map(function(car){
        car["default"] = cars.some(function(postCar){
          return postCar.number == car.number;
        });
        return car;
      });
      self.update({
        phone: phone
      },{
        $set:{
          cars: user.cars
        }
      }, callback);
    });
  }
});