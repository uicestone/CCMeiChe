var ServeRegion = require('../../model/serveregion');

exports.update = function(req,res,next){
	var id = req.params.id;
	var region = {};

	["name","points"].forEach(function(key){
		if(req.body[key]){
			region[key] = req.body[key];
		}
	});


	ServeRegion.updateById(id, {
		$set: region
	}, function(err){
		if(err){
			return next(err);
		}
		res.send({msg:"ok"});
	});
}

exports.add = function(req,res,next){



}