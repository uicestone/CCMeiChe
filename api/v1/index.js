module.exports = function(app){
  return function(){
    var apis = [
      "signin",
      "order",
      "upload",
      "vcode",
      "car"
    ];

    var verbs = [
      "get",
      "post",
      "put",
      "delete"
    ];

    apis = apis.map(function(name){
      var api = require("./" + name);
      api.name = name;
      return api;
    });

    apis.forEach(function(api){
      verbs.forEach(function(verb){
        var handler = api[verb];
        handler && app[verb].apply(app,['/' + api.name].concat(handler));
      });
    });
  }
}