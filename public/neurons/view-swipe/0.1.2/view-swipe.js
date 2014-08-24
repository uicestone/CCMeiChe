(function(){
function mix(a,b){for(var k in b){a[k]=b[k];}return a;}
var _0 = "view-swipe@0.1.2/index.js";
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_0, [], function(require, exports, module, __filename, __dirname) {
var swipe = {};
module.exports = swipe;


var DOC = document;

function generateTransform(direction) {
  var width = window.innerWidth;
  var height = window.innerHeight;
  if (direction == "left") {
    return "translateX(-" + width + "px)";
  }

  if (direction == "right") {
    return "translateX(" + width + "px)";
  }

  if (direction == "top") {
    return "translateY(-" + height + "px)";
  }

  if (direction == "bottom") {
    return "translateY(" + height + "px)";
  }
}

swipe.stack = [];

swipe.in = function (elem, direction, duration) {
  running = true;
  duration = duration || 300;
  var elem = elem;
  var container = DOC.createElement('div');
  container.setAttribute('class', 'swipe-container');

  function appendStyle(elem, styles){
    for(var key in styles){
      elem.style[key] = styles[key];
    }
  }

  appendStyle(container ,{
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden"
  });


  var inner = DOC.createElement('div');
  inner.setAttribute('class', 'swipe-inner');

  appendStyle(inner, {
    "transition": "all " + duration / 1000 + "s linear",
    "height": "100%"
  });

  container.appendChild(inner);
  inner.appendChild(elem);

  DOC.body.appendChild(container);

  inner.style.webkitTransform = generateTransform(direction);
  setTimeout(function () {
    inner.style.webkitTransform = "";
  }, 0);
  swipe.stack.push(container);
}

swipe.out = function (direction) {
  var viewElem = swipe.stack.pop();
  if (viewElem) {
    viewElem.querySelector('.swipe-inner').style.webkitTransform = generateTransform(direction);
  }
}
}, {
    main:true,
    map:globalMap
});
})();