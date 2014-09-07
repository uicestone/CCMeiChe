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
  }
});