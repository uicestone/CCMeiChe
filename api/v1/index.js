module.exports = function(app){
  return function(){
    var auth = require('./auth');
    var myorders = require('./myorders');

    app.get("vcode", require("./vcode").get);
    app.post("signin", require("./signin").post);
    app.post("signout", require("./signout").post);

    app.get("uploadtoken", auth, require("./uploadtoken").get);

    app.get("myorders", auth, myorders.list);
    app.post("myorders/cancel", auth, myorders.assure_match, myorders.cancel);
    app.post("myorders/confirm", auth, myorders.confirm);
    app.post("estimate", auth, require("./estimate").post);
    app.post("orders/:orderid", require("./orders").detail);
    app.post("orders/:orderid/arrive", require("./orders").arrive);
    app.post("orders/:orderid/done", require("./orders").done);
    app.post("orders", require("./orders").list);
    app.get("mycars", auth, require("./mycars").get);
    app.post("mycars", auth, require("./mycars").post);
    app.post("myaddresses", auth, require("./myaddresses").add);
    app.post("myaddresses/:index", auth, require("./myaddresses").update);

    app.get("cartypes/:query", require("./cartypes").get);
    app.post("recharge/:price", require("./recharge").post);
    // app.get("location/address/:address", require("./location").address);
    app.get("location/latlng/:lat,:lng", require("./location").latlng);
    app.get("location/suggestion/:query", require("./location").suggestion);
  }
}