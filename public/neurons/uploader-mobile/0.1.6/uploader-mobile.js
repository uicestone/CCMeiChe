(function(){
function mix(a,b){for(var k in b){a[k]=b[k];}return a;}
var _0 = "events@~1.0.5";
var _1 = "util@~1.0.4";
var _2 = "zepto@~1.1.3";
var _3 = "underscore@~1.6.0";
var _4 = "attributes@~1.4.0";
var _5 = "uploader-mobile@0.1.6/src/queue.js";
var _6 = "uploader-mobile@0.1.6/src/errors.js";
var _7 = "uploader-mobile@0.1.6/src/adapter/ajax.js";
var _8 = "uploader-mobile@0.1.6/src/theme/default.js";
var _9 = "uploader-mobile@0.1.6/src/uid.js";
var _10 = "simple-mime@^0.0.8";
var _11 = "uploader-mobile@0.1.6/src/index.js";
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_11, [_0,_1,_2,_3,_4,_5,_6,_7,_8], function(require, exports, module, __filename, __dirname) {
'use strict';

var events = require("events");
var util = require("util");
var $ = require("zepto");
var Queue = require("./queue");
var _ = require("underscore");
var attributes = require("attributes");
var Errors = require("./errors");

module.exports = Uploader;

var adapters = {
    ajax : require("./adapter/ajax")
};


function Uploader(element,config){
    var theme = config.theme || require("./theme/default");
    var self = this;

    this.type = config.type || this._getType();

    this.set('autoUpload',config.autoUpload);
    this.set('queueTarget',config.queueTarget || "#queue");
    this.set('multipleLen',config.multipleLen || -1 );
    this.set('beforeUpload',config.beforeUpload);
    this.set('data',config.data);

    var adapter = new adapters[this.type](element,config);
    // 初始化上传队列

    this._initQueue();

    adapter.on("load",function(){
        self.emit("load");
    });

    adapter.on("select",function(e){
        var queue = self.get('queue'),
            curId = self.get('currentId'),
            files = e.files;

        files = self._processExceedMultiple(files);
        self.emit("select",{files:files});

        _.forEach(files,function(file){
            queue.add(file);
        });
        if (!curId && self.get('autoUpload')) {
            self.upload();
        }
    });

    adapter.on('start',function(e){
        self.emit("start",e);
        self.set('currentId',e.file.id);
    });

    adapter.on("progress",function(e){
        var queue = self.get("queue");
        queue.updateFileStatus(e.file,"progress");
        self.emit("progress",e);
    });

    adapter.on("success",function(e){
        self.emit("success",e);
    });

    adapter.on("error",function(e){
        self.emit("error",e);
    });

    self.on("success",function(e){
        var queue = self.get("queue");
        queue.updateFileStatus(e.file,"success");
        self.emit("complete",e);
    });

    self.on("error",function(e){
        var queue = self.get("queue");
        queue.updateFileStatus(e.file,"error");
        self.emit("complete",e);
    });

    self.on("complete",function(e){
        var queue = self.get("queue");
        var file = e.file;
        self._continue();
    });

    self.on("enable",function(){
        adapter.setDisabled(false);
    });

    self.on("disable",function(){
        adapter.setDisabled(true);
    });

    this.set("adapter",adapter);

    this._auth(config);
    this._theme(theme);
}

Uploader.addAdapter = function(name, adapter){
    adapters[name] = adapter;
}
util.inherits(Uploader,events);
attributes.patch(Uploader,{
    queueTarget:{
        setter: function(selector){
            return $(selector);
        }
    },
    beforeUpload:{value:function(){}},
    theme:{value:{}},
    data:{value:{}},
    /**
     * 是否自动上传
     * @type Boolean
     * @default true
     */
    autoUpload:{
        value:true,
        setter:function(v){
            if(v===undefined){
                return true
            }
        }
    },
    /**
     * Queue队列的实例
     * @type Queue
     * @default {}
     */
    queue:{value:{}},
    /**
     * 上传方式实例
     * @type UploaderType
     * @default {}
     */
    adapter:{value:{}},
    /**
     * 用于限制多选文件个数，值为负时不设置多选限制
     * @type Number
     * @default -1
     */
    multipleLen:{value:-1},
    maxItems:{value:-1},
    /**
     *  当前上传的文件对应的在数组内的Id，如果没有文件正在上传，值为空
     *  @type Number
     *  @default ""
     */
    currentId:{value:''},
    isAllowUpload:{value:true},
    isSuccess:{value:function(){return true;}}
});

Uploader.prototype.upload = function(file){
    var self = this;
    var beforeUpload = this.get('beforeUpload');

    if(!file){
        this._continue();
    }else{
        file.ext = "." + _.chain(file.name.split(".")).reverse().value()[0];
        if(beforeUpload){
            beforeUpload.call(self, file, _.bind(this._upload,this,file));
        }else{
            this._upload(file);
        }
    }
}

Uploader.prototype._upload = function(file){
    var adapter = this.get("adapter");
    this.get("data") && adapter.setData(this.get("data"));
    adapter.upload(file);
}

Uploader.prototype.remove = function(file){
    this.get("queue").remove(file);
}

Uploader.prototype._convertSizeUnit = function(size){
    var match = size.match(/(\d+)(\w)/);
    var count = match[1];
    var unit = match[2];
    var units = ["K","M","G"];
    return count * Math.pow(1024, units.indexOf(unit) + 1);
}


Uploader.prototype._auth = function(config){
    var self = this;
    var maxItems = config.maxItems;
    var allowExtensions = config.allowExtensions;
    var maxSize = config.maxSize || -1;
    var adapter = this.get("adapter");

    maxItems && self.set("maxItems",maxItems);

    allowExtensions
    && self.on("load",function(){
        self.get("adapter").setFileTypes(allowExtensions);
    });

    this.on('add', function(e){
        var file = e.file;
        if(maxSize > 0 && self._convertSizeUnit(maxSize) < file.size){
            return self.emit("error",{
                file:file,
                code: Errors.UPLOAD_FAILED,
                message: "UPLOAD_FAILED"
            });
        }
    });

    this.on('success', function(){
        if(self.reachMax()){
            self.emit("disable");
        }
    });

    this.on("remove", function(){
        if(!self.reachMax()){
            self.emit("enable");
        }
    });
    return this;
}


Uploader.prototype._initQueue = function () {
    var self = this, queue = new Queue();
    //将上传组件实例传给队列，方便队列内部执行取消、重新上传的操作
    queue.set('uploader', self);

    queue.on('add',function(ev){
        self.emit("add",ev);
    });

    //监听队列的删除事件
    queue.on('remove', function (ev) {
        self.emit("remove",ev);
    });
    self.set('queue', queue);
    return queue;
};

Uploader.prototype._createItem = function (event) {
  var self = this;
  var container = this.get('queueTarget');
  var file = event.file;
  var item = $(_.template(this.get('theme').template, file));
  item.attr('id', 'J_upload_item_' + file.id);
  item.appendTo(container);

  item.find(".J_upload_remove").on("click", function () {
    self.remove(file);
  });
};

Uploader.prototype._theme = function(theme){
    var self = this;
    this.set('theme',theme);
    self.on('add',function(file){
        self._createItem(file);
    });

    _.forEach(['load','add','remove','start','progress','success','error','complete'],function(ev){
        self.on(ev,function(e){
            var func = theme[ev];
            if(e && _.isObject(e) && e.file){
                e.elem = $("#J_upload_item_" + e.file.id);
            }
            func && func.call(self,e);
        });
    });
}

Uploader.prototype._successCount = function(){
    return this.get("queue").getFilesByStatus("success").length;
}

Uploader.prototype.reachMax = function(){
    var maxItems = this.get("maxItems");
    return maxItems > 0 && maxItems <= this._successCount();
}

/**
 * 超过最大多选数予以截断
 */
Uploader.prototype._processExceedMultiple = function (files) {
    // var filesArr = [];
    var self = this,
        multipleLen = self.get('multipleLen'),
        maxItems = self.get("maxItems"),
        succeeded = self._successCount();

    if ( (multipleLen < 0 && maxItems < 0 ) || !files.length) return files;
    return _.filter(files, function (file, index) {
        if(maxItems < 0){
            return index < multipleLen;
        }

        if(multipleLen < 0){
            return index < maxItems - succeeded;
        }

        return index < multipleLen && index < maxItems - succeeded;
    });
};

Uploader.prototype._continue = function(){
    var queue = this.get("queue");
    var file = queue.getFilesByStatus("waiting")[0];
    if(file){
        this.upload(file);
    }else{
        this.set('currentId',null);
    }
}

Uploader.prototype._getType = function(){
    return "ajax";
}


}, {
    main:true,
    map:mix({"./queue":_5,"./errors":_6,"./adapter/ajax":_7,"./theme/default":_8},globalMap)
});

define(_5, [_0,_1,_4,_3,_9], function(require, exports, module, __filename, __dirname) {
var events = require("events");
var util = require("util");
var attributes = require("attributes");
var uid = require("./uid");
var _ = require("underscore");

module.exports = Queue;


function Queue(){

}

util.inherits(Queue,events);
attributes.patch(Queue,{
    uploader:{value:{}},
    files:{value:[]}
});

Queue.prototype.getFileById = function (id) {
    var self = this;
    var files = self.get('files');
    return _.filter(files,function(file){
        return file.id == id;
    })[0];
};

Queue.prototype.getFilesByStatus = function(status){
    var files = this.get("files");
    function matchStatus(file){
        return file.status == status;
    }

    return _.filter(files,matchStatus);
};

Queue.prototype.remove = function(file){
    var files = this.get("files");
    var id = file.id
    if(!files){return;}
    if(!id){id = files[0].id}
    var new_files = [];
    var file;
    _.forEach(files,function(f){
        if(f.id == id){
            file = f;
        }else{
            new_files.push(f);
        }
    });

    if(file){
        this.set("files",new_files);
        this.emit("remove",{
            file:file
        });
    }
}

Queue.prototype.updateFileStatus = function(file,status){
    try{
      file = this.getFileById(file.id);
    }catch(e){
      window.onerror(e.stack.toString());
    }
    if(file){
      file.status = status;
    }
    return true;
}

Queue.prototype.clear = function(){
    var self = this;

    function _remove(){
        var files = self.get("files");
        if(files.length){
            self.remove(files[0]);
            _remove();
        }else{
            self.emit("clear");
        }
    }
    _remove();
}

Queue.prototype.add = function(file){
    var files = this.get('files');
    var uploader = this.get('uploader');
    file.status = "waiting";
    files.push(file);
    this.emit("add",{
        file:file
    });
};


}, {
    map:mix({"./uid":_9},globalMap)
});

define(_6, [], function(require, exports, module, __filename, __dirname) {

var ERRORS = {
    "HTTP_ERROR"                  : "-200",
    "MISSING_UPLOAD_URL"          : "-210",
    "IO_ERROR"                    : "-220",
    "SECURITY_ERROR"              : "-230",
    "UPLOAD_LIMIT_EXCEEDED"       : "-240",
    "UPLOAD_FAILED"               : "-250",
    "SPECIFIED_FILE_ID_NOT_FOUND" : "-260",
    "FILE_VALIDATION_FAILED"      : "-270",
    "FILE_CANCELLED"              : "-280",
    "UPLOAD_STOPPED"              : "-290",
    "JSON_PARSE_FAILED"           : "-300",
    "CUSTOM_DEFINED_ERROR"        : "-310"
};

module.exports = ERRORS;
}, {
    map:globalMap
});

define(_7, [_2,_1,_0,_4,_3,_10,_6], function(require, exports, module, __filename, __dirname) {
var EMPTY = '';
var $ = require('zepto');
var util = require('util');
var events = require('events');
var attributes = require('attributes');
var _ = require('underscore');
var mime = require('simple-mime')('application/octect-stream');
var Errors = require('../errors');
var uuid = 0;
module.exports = AjaxUploader;

/**
 * @name AjaxUploader
 * @class ajax方案上传
 * @constructor
 * @requires UploadType
 */
function AjaxUploader(elem, config) {
  elem = $(elem);
  var self = this;
  var btn = this._btn = AjaxUploader._renderButton(elem);

  this.files = [];
  this.set('config', config);
  btn.on('click',function(){
    if(self.get("isDisabled")){
      return false;
    }
  });
  btn.on('change', function (e) {
    for (var i = 0; i < this.files.length; i++) {
      var file = this.files[i];
      file.id = uuid++;
      self.files.push(file);
    }

    self.emit('select', {
      files: self.files
    });
    btn.val("");
  });

  setTimeout(function () {
    self.emit('load');
  });

}

util.inherits(AjaxUploader, events);

AjaxUploader._renderButton = function (elem, config) {
  var self = this;
  var btn = $("<input multiple capture='camera' type='file' />");
  elem.css("position", "relative");
  btn.css({
    "position": "absolute",
    "top": 0,
    "left": 0,
    "opacity": 0,
    "width": elem.width(),
    "height": elem.height()
  });
  btn.appendTo(elem);
  return btn;
};


AjaxUploader.prototype.setDisabled = function(isDisabled){
  this.set("isDisabled",isDisabled);
};

AjaxUploader.prototype.setFileTypes = function(extensions) {
  var accept = _.map(extensions, function(ext){
    return mime(ext);
  }).join(",");
  this._btn.attr("accept", accept);
};

AjaxUploader.prototype.upload = function (file) {
  var file = _.filter(this.files,function(file){
    return file.status == "waiting";
  })[0];

  var config = this.get('config');
  var data = this.get('data');
  var self = this;
  var xhr = new XMLHttpRequest();
  xhr.open('POST', config.action, true);

  var formData = new FormData();
  formData.append(config.name, file);
  for (var key in data) {
    formData.append(key, data[key]);
  }

  xhr.upload.addEventListener('progress', function (e) {
    self.emit('progress', {
      file: file,
      uploaded: e.loaded,
      total: e.total
    });
  });

  xhr.addEventListener('load', function (e) {
    var isSuccess = _.isFunction(config.isSuccess) ? config.isSuccess : function () {
      return true;
    };
    var error = null;
    var data = xhr.responseText;
    self.files.shift();

    function emitErr(key){
      self.emit("error",{
        file:file,
        code: Errors[key],
        message: key
      });
    }

    if(xhr.status !== 200){
      return emitErr("HTTP_ERROR");
    }

    try {
      data = JSON.parse(data);
    } catch (e) {
      return emitErr("JSON_PARSE_FAILED");
    }

    if (!isSuccess(data)) {
      return emitErr("CUSTOM_DEFINED_ERROR");
    }

    self.emit("success", {
      file: file,
      data: data
    });

  });

  xhr.addEventListener('error', function (e) {
    self.emit('error', {
      file:file,
      code: Errors.UPLOAD_FAILED,
      message: "UPLOAD_FAILED"
    });
  });

  xhr.send(formData);
};

AjaxUploader.prototype.setData = function (data) {
  this.set('data', data);
};

attributes.patch(AjaxUploader, {
  config: {
    value: {}
  },
  data: {
    value: {}
  },
  isDisabled:{
    value: false
  }
});
}, {
    map:mix({"../errors":_6},globalMap)
});

define(_8, [], function(require, exports, module, __filename, __dirname) {
module.exports = {
    template: '<li>'
                +'<div class="pic" style="display:none"><img /></div>'
                +'<div class="name"><%=name%></div>'
                +'<div class="status"></div>'
                +'<div class="progress">'
                +    '<div class="percent" style="background-color:#39d;"></div>'
                +'</div>'
                +'<span class="J_upload_remove remove">x</span>'
            +'</li>',
    success: function(e){
        var elem = e.elem;
        elem.find(".pic").show();
        elem.find("img").attr("src",e.data.path);
        elem.find(".progress").hide();
        elem.find(".status").addClass("ok").html("成功");
    },
    remove: function(e){
        var elem = e.elem;
        elem && elem.remove();
    },
    progress: function(e){
        var elem = e.elem;
        elem.find(".percent").css("width", e.uploaded / e.total * 100 + "%");
    },
    error: function(e){
      var elem = e.elem;
      elem.find(".progress").hide();
      elem.find(".status").addClass("fail").html("失败");
    }
}
}, {
    map:globalMap
});

define(_9, [], function(require, exports, module, __filename, __dirname) {
var count = 0;

module.exports = function(){
    return count++;
}
}, {
    map:globalMap
});
})();