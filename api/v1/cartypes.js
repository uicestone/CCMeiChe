var CarTypes = require("../../model/cartype");

exports.get = function(req,res,next){
  var query = req.params.query;
  query = query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  var reg = new RegExp("^" + query.toLowerCase());
  CarTypes.find({
    $or:[{
      spell: reg
    },{
      type: reg
    }]
  }).toArray(function(err,types){
    if(err){
      return next(err);
    }

    res.send(types.map(function(item){
      return item.type;
    }));
  });
}