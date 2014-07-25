module.exports = function(app){
  return function(){
    var apis = [
      "signin",
      "order",
      "upload"
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
        api[verb] && app[verb]('/' + api.name, api[verb]);
      });
    });
  }
}