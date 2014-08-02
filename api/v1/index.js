module.exports = function(app){
  return function(){
    var auth = require('./auth');

    app.get("vcode", require("./vcode").get);
    app.post("signin", require("./signin").post);
    app.post("signout", require("./signout").post);

    app.get("order", auth, require("./order").get);
    app.put("order", auth, require("./order").put);
    app.get("car", auth, require("./car").get);
    app.put("car", auth, require("./car").put);
    app.get("location/address/:address", require("./location").address)
    app.get("location/latlng/:lat,:lng", require("./location").latlng)
  }
}