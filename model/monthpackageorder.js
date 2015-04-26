var db = require('../db');
var Model = require('./base');
var MonthPackageOrder =  Model("monthpackageorder");

module.exports = MonthPackageOrder;

db.bind('monthpackageorder', {
  findByCarNumber: function(carNumber, callback){
    var self = this;
    self.findOne({
      "cars.number": carNumber,
      "endtime": {
        $gt: new Date()
      }
    }, callback);
  },
  findCurrentMonthByUser: function(user, callback){
    var self = this;
    self.findOne({
      "user._id": user._id,
      "endtime": {
        $gt: new Date()
      }
    }, callback);
  }
});
