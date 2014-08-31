var CarTypes = require("../../model/cartype");

exports.get = function(req,res,next){
  var query = req.params.query;
  CarTypes.find({
    $or:[{
      spell: new RegExp("^" + query)
    },{
      type: new RegExp("^" + query)
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