(function(){
function mix(a,b){for(var k in b){a[k]=b[k];}return a;}
var _0 = "util@~1.0.0";
var _1 = "events@~1.0.0";
var _2 = "hashstate@0.1.0/index.js";
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_2, [_0,_1], function(require, exports, module, __filename, __dirname) {
'use strict';

module.exports = hashState;

var win = window;
var doc = document;
var documentMode = doc.documentMode;

var util = require('util');
var events = require('events');


var STR_HASH = '#';

hashState.POLL_INTERVAL = 50;

function hashState (options) {
  return new HashState(options || {});
}

function HashState (options) {
  this.prefix = options.prefix || '!';
  this.split = options.split || ',';
  this.assign = options.assign || '=';
  this.win = options.window || window;
  this.location = this.win.location;

  var self = this;
  this._p = function () {
    self._poll();
  };

  this._initEvents();
}

util.inherits(HashState, events);


// {a: 1, b: 'c'} -> 'a=1,b=c'
HashState.prototype.stringify = function (object) {
  var pairs = [];
  var key;
  var value;
  for (key in object) {
    value = object[key];
    value = value === undefined
      ? ''
      : value;
    pairs.push(key + this.assign + value);
  }
  return pairs.join(this.split);
};


// '#!a=1,b=c' -> {a: '1', b: 'c'}
// '!a=1,b=c' -> {a: '1', b: 'c'}
// '#a=1,b=c' -> {a: '1', b: 'c'}
HashState.prototype.parse = function (str) {
  var object = {};
  if (util.isString(str)) {
    str = removeLeading(removeLeading(str, STR_HASH), this.prefix);
    str.split(this.split).forEach(function (pair) {
      var split = pair.split(this.assign);
      object[split[0]] = split[1] || undefined;
    }, this);
  }
  return object;
};


function removeLeading (str, leading) {
  // 'abc'.indexOf('') === 0
  return leading && str.indexOf(leading) === 0
    ? str.substr(leading.length)
    : str;
}


// Sets the browser's location hash
// @param {string} hash New location hash
HashState.prototype.setHash = function (hash, options) {
  hash = this._clean(hash);
  var mute = options && options.mute;
  this._mute(hash, mute);
  this.location.hash = (this.prefix || '') + hash;
  if (!mute) {
    this._poll();
  }
};


// Replaces the browser's current location hash with the specified hash
// and removes all forward navigation states, without creating a new browser
// history entry.
// @param {string} hash New location hash
HashState.prototype.replaceHash = function (hash, options) {
    var base = this.location.href.replace(/#.*$/, '');
    hash = this._clean(hash);

    var mute = options && options.mute;
    this._mute(hash, mute);
    this.location.replace(base + STR_HASH + (this.prefix || '') + hash);
    if (!mute) {
      this._poll();
    }
};


HashState.prototype._clean = function(hash) {
  if (Object(hash) === hash) {
    hash = this.stringify(hash);
  }
  return removeLeading(removeLeading(hash, STR_HASH), this.prefix);
};


HashState.prototype._mute = function(hash, mute) {
  if (mute) {
    this.hash = hash;
  }
};


HashState.prototype.getHash = function () {
  // From YUI3
  // > Gecko's window.location.hash returns a decoded string and we want all
  // > encoding untouched, so we need to get the hash value from
  // > window.location.href instead. We have to use UA sniffing rather than
  // > feature detection, since the only way to detect this would be to
  // > actually change the hash.
  var matches  = /#(.*)$/.exec(this.location.href);
  var hash     = matches && matches[1] || '';

  return removeLeading(hash, this.prefix);
};


// From YUI3
// > Most browsers that support hashchange expose it on the window. Opera 10.6+
// > exposes it on the document (but you can still attach to it on the window).
//
// > IE8 supports the hashchange event, but only in IE8 Standards
// > Mode. However, IE8 in IE7 compatibility mode still defines the
// > event but never fires it, so we can't just detect the event. We also can't
// > just UA sniff for IE8, since other browsers support this event as well.
hashState.nativeHashChange = 
  ('onhashchange' in win || 'onhashchange' in doc)
  && (!documentMode || documentMode > 7);

HashState.prototype._initEvents = function() {
  this.hash = this.getHash();
  
  if (hashState.nativeHashChange) {
    this._hashChange();
  } else {
    this._pollChange();
  }
};


HashState.prototype._pollChange = function() {
  var self = this;
  this.timer = setInterval(function () {
    self._poll();
  }, hashState.POLL_INTERVAL);
};


HashState.prototype._poll = function() {
  var hash = this.getHash();
  var old = this.hash;
  if (hash !== old) {
    this.hash = hash;
    this.emit('hashchange', {
      newHash: hash,
      oldHash: old
    });
  }
};


HashState.prototype._hashChange = function() {
  this.win.addEventListener('hashchange', this._p, false);
};

}, {
    main:true,
    map:globalMap
});
})();