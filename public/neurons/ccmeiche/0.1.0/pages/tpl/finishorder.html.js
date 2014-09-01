(function(){
function mix(a,b){for(var k in b){a[k]=b[k];}return a;}
var _0 = "ccmeiche@0.1.0/pages/addcar.js";
var _1 = "ccmeiche@0.1.0/pages/finishorder.js";
var _2 = "ccmeiche@0.1.0/pages/home.js";
var _3 = "ccmeiche@0.1.0/pages/login.js";
var _4 = "ccmeiche@0.1.0/pages/mod/autocomplete.js";
var _5 = "ccmeiche@0.1.0/pages/mod/countdown.js";
var _6 = "ccmeiche@0.1.0/pages/mod/multiselect.js";
var _7 = "ccmeiche@0.1.0/pages/mod/popmessage.js";
var _8 = "ccmeiche@0.1.0/pages/mod/popselect.js";
var _9 = "ccmeiche@0.1.0/pages/mod/singleselect.js";
var _10 = "ccmeiche@0.1.0/pages/mod/swipe-modal.js";
var _11 = "ccmeiche@0.1.0/pages/mod/uploader.js";
var _12 = "ccmeiche@0.1.0/pages/myinfos.js";
var _13 = "ccmeiche@0.1.0/pages/myorders.js";
var _14 = "ccmeiche@0.1.0/pages/order.js";
var _15 = "ccmeiche@0.1.0/pages/preorder.js";
var _16 = "ccmeiche@0.1.0/pages/recharge.js";
var _17 = "ccmeiche@0.1.0/pages/tpl/addcar.html.js";
var _18 = "ccmeiche@0.1.0/pages/tpl/finishorder.html.js";
var _19 = "ccmeiche@0.1.0/pages/tpl/mixins.html.js";
var _20 = "ccmeiche@0.1.0/pages/tpl/preorder.html.js";
var entries = [_0,_1,_2,_3,_4,_5,_6,_7,_8,_9,_10,_11,_12,_13,_14,_15,_16,_17,_18,_19,_20];
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_18, [], function(require, exports, module, __filename, __dirname) {
module.exports = '<div id="finishorder" class="container"><h2 class="h2">洗车已完成</h2><ul class="photo-list finish_photos"></ul><div class="add-photo"><div class="area"><div class="text"><div class="title">照片上传</div><div class="desc">含号牌的车辆照片</div></div></div><div class="camera"><img src="/img/upload.png"/></div></div><h2 class="h2">车损部位</h2><ul class="breakages"><li data-index="1" class="breakage breakage-1"><img src="/img/breakages/icon-1.svg" width="100%"/></li><li data-index="2" class="breakage breakage-2"><img src="/img/breakages/icon-2.svg" width="100%"/></li><li data-index="3" class="breakage breakage-3"><img src="/img/breakages/icon-3.svg" width="100%"/></li><li data-index="4" class="breakage breakage-4"><img src="/img/breakages/icon-4.svg" width="100%"/></li><li data-index="5" class="breakage breakage-5"><img src="/img/breakages/icon-5.svg" width="100%"/></li><li data-index="6" class="breakage breakage-6"><img src="/img/breakages/icon-6.svg" width="100%"/></li><li data-index="7" class="breakage breakage-7"><img src="/img/breakages/icon-7.svg" width="100%"/></li><li data-index="8" class="breakage breakage-8"><img src="/img/breakages/icon-8.svg" width="100%"/></li><li data-index="9" class="breakage breakage-9"><img src="/img/breakages/icon-9.svg" width="100%"/></li><li data-index="10" class="breakage breakage-10"><img src="/img/breakages/icon-10.svg" width="100%"/></li></ul><ul class="photo-list breakage_photos"></ul><div class="add-photo"><div class="area"><div class="text"><div class="title">照片上传</div><div class="desc">含号牌的车辆照片</div></div></div><div class="camera"><img src="/img/upload.png"/></div></div><input type="button" value="完成" class="button submit"/><input type="button" value="取消" class="button cancel"/></div>'
}, {
    entries:entries,
    map:globalMap
});
})();