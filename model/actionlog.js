var logger = require("../logger");
var moment = require("moment");
var Model = require('./base');
var ActionLog = Model("actionlog");
var util = require("util");

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
		var time = moment().format("YYYY-MM-DD HH:mm:ss");
		var log = util.format("[actionlog][%s][%s][%s]%s",time,name,action,detail||"");

		console.log(log);
		ActionLog.insert({
			time: time,
			name: name,
			action: action,
			detail: detail,
			log: log
		});
	}
}