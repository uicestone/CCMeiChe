(function(){
function mix(a,b){for(var k in b){a[k]=b[k];}return a;}
var _0 = "ccmeiche@0.1.0/pages/home.js";
var _1 = "ccmeiche@0.1.0/pages/login.js";
var _2 = "ccmeiche@0.1.0/pages/menu.js";
var _3 = "ccmeiche@0.1.0/pages/mod/autocomplete.js";
var _4 = "ccmeiche@0.1.0/pages/mod/countdown.js";
var _5 = "ccmeiche@0.1.0/pages/mod/menu.js";
var _6 = "ccmeiche@0.1.0/pages/mod/multiselect.js";
var _7 = "ccmeiche@0.1.0/pages/mod/popmessage.js";
var _8 = "ccmeiche@0.1.0/pages/mod/popselect.js";
var _9 = "ccmeiche@0.1.0/pages/mod/singleselect.js";
var _10 = "ccmeiche@0.1.0/pages/mod/swipe-modal.js";
var _11 = "ccmeiche@0.1.0/pages/mod/uploader.js";
var _12 = "ccmeiche@0.1.0/pages/myinfos.js";
var _13 = "ccmeiche@0.1.0/pages/myorders.js";
var _14 = "ccmeiche@0.1.0/pages/order.js";
var _15 = "ccmeiche@0.1.0/pages/promos.js";
var _16 = "ccmeiche@0.1.0/pages/recharge.js";
var _17 = "ccmeiche@0.1.0/pages/tpl/addcar.html.js";
var _18 = "ccmeiche@0.1.0/pages/tpl/agreement.html.js";
var _19 = "ccmeiche@0.1.0/pages/tpl/finishorder.html.js";
var _20 = "ccmeiche@0.1.0/pages/tpl/mixins.html.js";
var _21 = "ccmeiche@0.1.0/pages/tpl/preorder.html.js";
var _22 = "ccmeiche@0.1.0/pages/views/addcar.js";
var _23 = "ccmeiche@0.1.0/pages/views/agreement.js";
var _24 = "ccmeiche@0.1.0/pages/views/finishorder.js";
var _25 = "ccmeiche@0.1.0/pages/views/preorder.js";
var entries = [_0,_1,_2,_3,_4,_5,_6,_7,_8,_9,_10,_11,_12,_13,_14,_15,_16,_17,_18,_19,_20,_21,_22,_23,_24,_25];
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_17, [], function(require, exports, module, __filename, __dirname) {
module.exports = '<div id="addcar" class="container"><h2 class="h2">我的车辆信息</h2><ul class="upload-list"></ul><div class="add-photo"><div class="area"><div class="text"><div class="title">照片上传</div><div class="desc">含号牌的车辆照片</div></div></div><div class="camera"><img src="/img/upload.png"/></div></div><div class="row type"><input placeholder="车型" data-pattern="/api/v1/cartypes/{q}" class="input"/><i class="icon"></i></div><div class="row number"><input placeholder="号牌" class="input number"/><i class="icon"></i></div><div class="row color"><input placeholder="颜色" class="input"/><i class="icon"></i></div><div class="row comment"><input placeholder="备注" class="input"/><i class="icon"></i></div><div class="row"><input type="button" value="提交" class="button submit"/><input type="button" value="取消" class="button cancel"/></div></div>'
}, {
    entries:entries,
    map:globalMap
});
})();