var choices = [{
  price: 50
},{
  price: 100,
  promo: "洗车券"
},{
  price: 200,
  promo: "洗车券"
},{
  price: 300,
  promo: "洗车券"
},{
  price: 400,
  promo: "洗车券"
},{
  price: 500,
  promo: "洗车券"
}]

module.exports = function(req,res){
  res.render("recharge",{
    id:"recharge",
    choices:choices
  });
}