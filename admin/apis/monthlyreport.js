var xlsx = require("node-xlsx");
var Model = require('../../model/base');
var fs = require('fs');
var temp = require('temp');
var async = require('async');
var moment = require('moment');


var Order = require("../../model/order");
var WorkerAction = Model("workeraction");
var Worker = Model("worker");
var Service = Model('service');


function downloadData(name, data, res){
	var buffer = xlsx.build([{name: name, data: data}]);
	var filepath = temp.path({suffix: '.xlsx'});
	fs.writeFile(filepath, buffer, function(err){
		res.download(filepath, name + ".xlsx", function(){
			fs.unlink(filepath);
		});
	});
}

function getServices(done){
	Service.find().toArray(done);
}

function getWorkers(done){
	Worker.find().toArray(done);
}

function workHoursInDay(day){
	var count = 0;
	day.actions.forEach(function(action, i){
		var last = day.actions[i-1];
		if(!last){return;}
		if(action.type == "off_duty" && last.type == "on_duty"){
			count += action.time - last.time;
		}
	});
	return count;
}

function getWorkHours(worker, date, done){
	var count = 0;
	WorkerAction.find({
		workerId: worker._id,
		month: moment(new Date()).format("YYYY-MM")
	}).toArray(function(err, days){
		days.forEach(function(err, day){
			count += workHoursInDay(day);
		});
		done(null, count);
	});
}

function countServiceInOrders(service, orders){
	return orders.filter(function(order){
		return order.service._id.toString() == service._id.toString();
	}).length;
}

function getFinishedOrders(worker, date, services, done){
	var result = {};

	Order.getMonthly(worker._id, date, function(err, orders){
		services.forEach(function(service){
			result[service.title] = countServiceInOrders(service, orders);
		});
		done(null, result);
	});
}

function getWorkerInfo(worker, services, date, done){
	var data = {};
	data["车工姓名"] = worker.name;

	async.parallel([
		function(done){
			getWorkHours(worker, date, done);
		},
		function(done){
			getFinishedOrders(worker, date, services, done);
		}
	], function(err, results){

		if(err){return done(err);}

		data["工作时长"] = results[0];
		for(var k in results[1]){
			data[k] = results[1][k];
		}

		done(null, data);
	});
}

function convertToTable(dataArr){
	var table = [];
	if(dataArr.length){
		table.push(Object.keys(dataArr[0]));
		dataArr.forEach(function(item){
			var row = Object.keys(item).map(function(key){
				return item[key];
			});
			table.push(row);
		});
		return table;
	}else{
		return [];
	}
}

function getData(year, month, done){
	var name = year + "年" + month + "月员工工作情况汇总";
	var result = [];

	var data = [];
	var date = new Date(year, month - 1);

	getServices(function(err, services){
		getWorkers(function(err, workers){
			async.map(workers, function(worker, done){
				getWorkerInfo(worker, services, date, done);
			}, function(err, results){
				var data = convertToTable(results);
				done(null, name, data);
			});
		});
	});
}

module.exports = function(req,res){
	var year = req.params.year;
	var month = req.params.month;
	getData(year, month, function(err, name ,data){
		downloadData(name, data, res);
	});
}