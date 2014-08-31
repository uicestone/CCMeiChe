var cartypes = require("./data/cartypes");
var CarTypesModel = require("./model/cartype");
var han = require("han");
var async = require("async");
// 抓取车型数据
// http://car.autohome.com.cn/zhaoche/pinpai/

// var data = [];
// seajs.use("jquery",function($){
//   "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(function(code){
//     var tab = $("#tab" + code);
//     var container = tab.next();
//     container.find("dl").each(function(i,el){
//       var brand = $(el).find("dt").text().trim();
//       $(el).find("dd ul li h4").each(function(i,el){
//         var type = $(el).text().trim();
//         data.push({
//           brand:brand,
//           type:type
//         })
//       });
//     });
//   });

//   console.log(data);

// });
var all = cartypes.length;
var current = 1;
async.parallel(cartypes.map(function(cartype){
  return function(done){
    console.log("update",cartype.type,current+"/"+all);
    current++;
    CarTypesModel.update({
      brand: cartype.brand,
      type: cartype.type
    },{
      brand: cartype.brand,
      type: cartype.type,
      spell: han.letter(cartype.type.replace("·",""))
    },{
      upsert: true
    },done);
  }
}),function(){
  console.log("done");
});