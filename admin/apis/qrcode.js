var PromoQr = require("../../model/promoqr");
var Recharge = require("../../model/recharge");
var async = require("async");
var uuid = require("uuid");

exports.add = function(req,res,next){
	var amount = +req.body.amount;
	var promo = req.body.promo;

	function fail(text){
		return res.send(400,text || "bad request");
	}

	if(!amount){
		return fail("amount not set");
	} 

	if(amount.toString() == "NaN"){
		return fail("amount invalid");
	}

	if(amount > 10 || amount < 0 ){
		return fail("amount out of range");
	}

	if(!promo){
		return fail("promo not set");
	}

	Recharge.findById(promo, function(err, recharge){
		if(err || !recharge){
			return fail("recharge not found");
		}

		async.times(amount,function(n, next){
			PromoQr.insert({
				token: uuid.v1(),
				createTime: new Date(),
				recharge: recharge._id,
				promoTitle: recharge.title,
				used: false
			}, next);
		},function(){	
			res.send("ok");
		});
	});

}