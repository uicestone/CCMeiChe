var PromoQr = require("../../model/promoqr");
var config = require("config");

module.exports = function(req,res,next){
	PromoQr.find().toArray(function(err, items){
		if(err){
			return next(err);
		}

		items = items.map(function(){
			item.url = "123";
			return item
		});

		console.log(items);


	  res.render('promo-qrcode',{
	    qrcodes: items,
	    user: req.user,
	    title: "优惠券二维码"
	  });
	});
}