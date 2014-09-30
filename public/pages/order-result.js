var $ = require('zepto');
var popMessage = require('./mod/popmessage');

$.post('/api/v1/myorders/share',{
  orderId: orderId
},'json').done(function(result){
  popMessage(result.message);
});