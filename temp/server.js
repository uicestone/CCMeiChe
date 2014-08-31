var http = require("http");

http.createServer(function(req,res){
  res.end(process.env.VAR);
}).listen(process.env.PORT||2000);