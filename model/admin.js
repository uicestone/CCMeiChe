var db = require('../db');
var Model = require('./base');
var Admin = Model("admin");
var md5 = require('MD5');
module.exports = Admin;


db.bind('admin',{
  validate: function(username, password, done){
    Admin.findOne({
      username: username
    }, function(err, user){
      if(err){
        return done(err);
      }
      if(!user){
        return done(null, false, { message: '用户名不存在' });
      }

      if(md5(password) !== user.password){
        return done(null, false, { message: '密码不正确' });
      }
      return done(null,user);
    });
  },
});