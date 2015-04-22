var User = require("../../model/user");
var MonthPackage = require("../../model/monthpackage");
var MonthPackageOrder = require("../../model/monthpackageorder");
var wechat_user = require("../../util/wechat").user;
var logger = require('../../logger');
var _ = require("underscore");
var moment = require("moment");

exports.post = function(req, res, next) {
	var id = req.params.id;
	MonthPackage.findById(id, function(err, monthpackage) {
		if (err || !monthpackage) {
			return next(err);
		}

		MonthPackageOrder.insert({
			monthpackage: monthpackage,
			endtime: +moment().add(30, "days").toDate(),
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