var logger = require("../logger");
var moment = require("moment")
function getUserName(user){
    var username = "";
	if(typeof user == "string"){
		return user;
	}
	if(user.orders){
		// is a workder
		return "车工:" + user.name;
	}else{

		try{
			username = user.wechat_info.nickname;
		}catch(e){
			username = user.phone;
		}
		// is a user
		return "用户:" + username;
	}
}

module.exports = {
	log: function(user, action, detail){
		var name = getUserName(user);
		console.log("[actionlog][%s][%s][%s]%s",moment().format("YYYY-MM-DD HH:mm:ss"),name,action,detail||"");
	}
}