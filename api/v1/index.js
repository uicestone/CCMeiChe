module.exports = function(app){
  return function(){
    var auth = require('./auth');

    app.get("vcode", require("./vcode").get);
    app.post("signin", require("./signin").post);
    app.post("signout", require("./signout").post);

    app.get("uploadtoken", auth, require("./uploadtoken").get);

    app.get("myorders", auth, require("./myorders").get);
    app.post("myorders", auth, require("./myorders").post);
    app.post("preorder", auth, require("./preorder").post);
    app.post("orders/:orderid", require("./orders").detail);
    app.post("orders/:orderid/arrive", require("./orders").arrive);
    app.post("orders/:orderid/done", require("./orders").done);
    app.post("orders", require("./orders").list);
    app.get("mycars", auth, require("./mycars").get);
    app.post("mycars", auth, require("./mycars").post);

    app.get("cartypes", require("./cartypes").get);
    app.post("recharge/:price", require("./recharge").post);
    // app.get("location/address/:address", require("./location").address);
    app.get("location/latlng/:lat,:lng", require("./location").latlng);
    app.get("location/suggestion/:query", require("./location").suggestion);
  }
}