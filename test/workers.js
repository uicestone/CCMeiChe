var worker = require("../model/worker");

module.exports = function(req,res,next){

  worker.find({
    latlng:{
      $near: req.params.latlng.split(",").map(function(item){return +item}),
      $maxDistance: req.params.kms / 111.12 // in kilometers
    }
  }).toArray(function(err,results){
    if(err){return next(err);}

    console.log(results);
    res.send(200,results);

  });

}