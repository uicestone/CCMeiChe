var errmodel = require("./model/error");

exports.frontend = function(req,res,next){
  console.log("track error frontend %s".red, req.query.msg);
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
  console.log("track error other %s".red, err.message);
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
  console.log("track error backend %s".red, err.message);
  errmodel.insert({
    type:"backend",
    time: new Date(),
    message: err.message,
    stack: err.stack,
    req: {
      reqid: req.reqid,
      url: req.url,
      headers: req.headers
    }
  });

  next(err);
}