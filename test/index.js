module.exports = function(app){
  return function(){
    app.get("/", function(req,res){
      res.sendfile("./test/mapview.html");
    });
    app.get("/workers/:latlng/:kms", require("./workers"));
    app.get("/walk/:from/:to", require("./walk"));
  }
}