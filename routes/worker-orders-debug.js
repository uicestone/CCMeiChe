var model = require('../model');
var Order = model.order;
var Worker = model.worker;

module.exports = function(req, res){
  Order.find({
    $or: [{
      status: "todo"
    },{
      status: "doing"
    }]
  }).toArray(function(err,orders){

    res.send(orders.map(function(order){
      return [
        "export WORKERID=" + order.worker._id,
        "http://localhost:4273/orders/" + order._id
      ].join("<br />");
    }).join("<br />"));

  });
}