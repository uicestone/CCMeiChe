var cartypes = require("./data/cartypes");
var CarTypesModel = require("./model/cartype");
var han = require("han");
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
cartypes.forEach(function(cartype){
  CarTypesModel.update({
    brand: cartype.brand,
    type: cartype.type,
    spell: han.letter(cartype.type)
  },{
    brand: cartype.brand,
    type: cartype.type,
    spell: han.letter(cartype.type.replace("·",""))
  },{
    upsert: true
  });
});