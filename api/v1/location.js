var baidumap = require('../../util/baidumap');

exports.latlng = function(req,res){
  baidumap.geocoder({
    location: [req.params.lat,req.params.lng].join(",")
  },function(err, result){
    if(err){return next();}
    res.status(200).send(result);
  });
}

exports.suggestion = function(req,res,next){
  baidumap.placeSearch({
    q: req.params.query,
    region: "上海"
  },function(err,result){
    if(err){return next(err);}
    res.status(200).send(result.results && result.results.filter(function(item){
      return item.location
    })||[]);
  });
}