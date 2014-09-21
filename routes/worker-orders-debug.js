var model = require('../model');
var Order = model.order;
var Worker = model.worker;

module.exports = function(req, res){
  Order.find({
    worker: {
      $exists: true
    },
    $or: [{
      status: "todo"
    },{
      status: "doing"
    }]
  }).toArray(function(err,orders){
    console.log(orders);
    res.send(orders.map(function(order){
      console.log(order);
      return [
        "export WORKERID=" + order.worker._id,
        "http://localhost:4273/orders/" + order._id
      ].join("<br />");
    }).join("<br />"));

  });
}