var baidumap = require('./util/baidumap');


function convert(name,coord){
	baidumap.geoconv({
	  coords: coord.join(","),
	  from: 1,
	  to: 5
	}, function(err,result){

		console.log(name,"origin", coord, result);
	});
}



convert("chen",[121.566574,31.249147]);
convert("feng",[121.568108,31.237646]);