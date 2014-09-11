var Worker = require('../../model').worker;
module.exports = function(req,res,next){
  Worker.find().toArray(function(err, workers){
    if(err){
      return next(err);
    }
    res.send({
      data: workers
    });
  });
}