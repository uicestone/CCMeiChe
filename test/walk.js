var baidumap = require('../util/baidumap');
module.exports = function(req,res,next){
  baidumap.direction({
    origin: req.params.from,
    destination: req.params.to,
    mode:"walking",
    origin_region: "上海",
    destination_region: "上海"
  }, function(err,solution){
    if(err){return next(err);}
    res.status(200).send(solution);
  });
}