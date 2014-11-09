var PromoQr = require("../../model/promoqr");
var Recharge = require("../../model/recharge");
var async = require("async");
var moment = require("moment");
var config = require("config");

module.exports = function(req,res,next){
	async.parallel([
		function getRecharges(done){
			Recharge.find().toArray(done);
		},
		function getQrcodes(done){
			PromoQr.find().sort({
				createTime:-1
			}).toArray(done);
		}
	],function(err, results){
		var recharges = results[0];
		var qrcodes = results[1];
		if(err){
			return next(err);
		}

		qrcodes = qrcodes.map(function(item){
			item.url = encodeURIComponent(config.host.user + "/consume_promoqr?token=" + item.token);
			item.createTime = moment(item.createTime).format("YYYY-MM-DD hh:mm");
			item.expired = +new Date - new Date(item.createTime) > 24 * 3600 * 1000;
			return item;
		});

	  res.render('promo-qrcode',{
	  	recharges: recharges,
	    qrcodes: qrcodes,
	    user: req.user,
	    title: "优惠券二维码"
	  });
	});
}