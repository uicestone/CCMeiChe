var Worker = require('../../model').worker;
exports.list = function(req,res,next){
  Worker.find().toArray(function(err, workers){
    if(err){
      return next(err);
    }
    res.send({
      data: workers
    });
  });
}

exports.create = function(req,res,next){
  if(!req.isAuthenticated()){
    return res.send(403,{
      code: 403,
      message: "denied"
    });
  }

  if(!req.body.name || !req.body.phone || !req.body.openid){
    return res.send(400,{
      code: 400,
      message: "wrong args"
    });
  }

  Worker.insert({
    name: req.body.name,
    phone: req.body.phone,
    openid: req.body.openid
  }, function(err, workers){
    if(err){
      return next(err);
    }

    res.send(200, workers[0]);
  });


}