var ServeRegion = require('../../model/serveregion');

exports.update = function(req,res,next){
	var id = req.params.id;
	var region = {};

	if(req.body.points){
		region.points = req.body.points.map(function(p){
			return p.map(function(d){return +d})
		});
	}else{
		res.send(400, "bad request");
	}

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