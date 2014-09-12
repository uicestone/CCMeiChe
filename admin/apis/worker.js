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
      message: "参数不完整"
    });
  }

  var data = {
    name: req.body.name,
    phone: req.body.phone,
    openid: req.body.openid
  }

  if(!data.phone.match(/^1\d{10}/)){
    return res.send(400,{
      code: 400,
      message: "错误的手机格式"
    });
  }

  Worker.insert(data, function(err, workers){
    if(err){
      return next(err);
    }

    res.send(200, workers[0]);
  });


}