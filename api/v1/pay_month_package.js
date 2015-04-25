var User = require("../../model/user");
var MonthPackage = require("../../model/monthpackage");
var MonthPackageOrder = require("../../model/monthpackageorder");
var wechat_user = require("../../util/wechat").user;
var logger = require('../../logger');
var _ = require("underscore");
var moment = require("moment");

// 购买后，生成一条包月洗车的订单，包含车辆信息，位置信息
exports.post = function(req, res, next) {
	var id = req.params.id;
    var cars = req.body.cars;
    var latlng = req.body.latlng;
    var address = req.body.address;
    var carpark = req.body.carpark;


    if(!address){
        return next("请填写地址");
    }

    if(!carpark){
        return next("请填写车位信息");
    }

    if(!latlng){
        return next("缺少经纬度，请选择地址");
    }

    latlng = latlng.split(",");

	MonthPackage.findById(id, function(err, monthpackage) {
		if (err || !monthpackage) {
			return next(err);
		}

		MonthPackageOrder.insert({
			monthpackage: monthpackage,
			endtime: moment().add(30, "days").toDate(),
            cars: cars,
            address: address,
            carpark: carpark,
            latlng: latlng,
			user: _.pick(req.user, "_id", "phone")
		}, function(err, orders) {
			if (err) {
				return next(err);
			}
			var order = orders[0];
			wechat_user.pay_request(req, {
				id: order._id,
				price: order.monthpackage.price,
				name: order.monthpackage.title,
				attach: {
					type: "monthpackage"
				}
			}, function(err, payment_args) {
				if (err) {
					return next(err);
				}
				res.status(200).send({
					orderId: order._id,
					payment_args: payment_args
				});
			});
		});
	});
}