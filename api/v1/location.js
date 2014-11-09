var baidumap = require('../../util/baidumap');
var async = require('async');
exports.latlng = function(req,res,next){
  var loc = [req.params.lng,req.params.lat].join(",");
  async.waterfall([function(done){
    baidumap.geoconv({
      coords: loc,
      from: 1,
      to: 5
    }, done);
  },function(json, done){
    if(json.status != 0){
      return done(json.message);
    }
    baidumap.geocoder({
      pois: 1,
      location: json.result[0].y + "," + json.result[0].x
    },done);
  }], function(err, result){
    if(err){return next(err);}
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
      return item.location && item.address;
    })||[]);
  });
}
