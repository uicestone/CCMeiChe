var http = require("http");

http.createServer(function(req,res){
  console.log(req.url);
}).listen(1337);