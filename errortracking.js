var errmodel = require("./model/error");
var raygun = require('raygun');
var raygunClient = new raygun.Client().init({ apiKey: 'XspbP/t9+hACoU4yPsjHzg==' });

exports.frontend = function(req,res,next){
  console.log("track error frontend %s %s %s".red, req.query.msg, req.query.url, req.query.line);
  errmodel.insert({
    type:"frontend",
    time: new Date(),
    message: req.query.msg,
    url: req.query.url,
    line: req.query.line,
    req: {
      url: req.url,
      headers: req.headers
    }
  });
  return res.type("gif").status(200).send("");
}

exports.other = function(err,req,res,next){
  console.log("track error other %s".red, err.stack || err.message || err.toString());
  errmodel.insert({
    type:"other",
    time: new Date(),
    message: err.message,
    stack: err.stack,
    req: {
      reqid: req.reqid,
      url: req.url,
      headers: req.headers
    }
  });
}

exports.backend = function(err,req,res,next){
  if(typeof err == "string"){
    err = new Error(err);
  }
  raygunClient.send(err);
  console.log("track error backend %s %s".red, err.message, err.stack);
  errmodel.insert({
    type:"backend",
    time: new Date(),
    name: err.name,
    message: err.message,
    stack: err.stack,
    req: {
      reqid: req.reqid,
      url: req.url,
      headers: req.headers
    }
  });

  if(err.name == "WeChatAPIError" && process.env.CCDEBUG){
    res.status(200).send({message:"ok"});
  }else{
    next(err);
  }

}