var user = require("../util/wechat").user.api;

user.sendText("ofgxpuFs2sVC8mPKBGSjANvbehNM","感谢您使用CC美车服务，请留言对我们的服务作出评价，帮我我们改进与完善，谢谢！", function(err){
	console.log(err);
});