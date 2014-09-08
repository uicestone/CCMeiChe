var Order = require('../../model/order');
var async = require('async');
var assert = require('chai').assert;
var expect = require('chai').expect;

if(process.env.NODE_ENV !== "test"){
  console.log("please set NODE_ENV to test");
  process.exit(1);
}

describe('order',function(){

  beforeEach(function(done){
    async.parallel([
      function(done){
        Order.remove(done);
      }
    ],done);
  });

  describe("_adjustRests", function(){
    var steps;
    var orders
    beforeEach(function(){
      steps = [];
      orders = [
        {
          _d:"a",
          worker:{_id:"1"},
          status:"preorder",
          preorder_time: new Date(2014,9,8,8,32),
          estimated_arrive_time: new Date(2014,9,8,9,32),
          estimate_finish_time: new Date(2014,9,8,10,32),
          latlng:"31.52,121.22"
        },
        {
          id:"b",
          worker:{_id:"1"},
          status:"todo",
          preorder_time: new Date(2014,9,8,8,52),
          estimated_arrive_time: new Date(2014,9,8,9,52),
          estimate_finish_time: new Date(2014,9,8,10,52),
          latlng:"31.22,121.42"
        },
        {
          worker:{_id:"1"},
          status:"done",
          preorder_time: new Date(2014,9,8,8,42),
          estimate_finish_time: new Date(2014,9,8,10,42),
          latlng:"31.92,121.12"
        },
        {
          worker:{_id:"2"},
          status:"done",
          estimate_finish_time: new Date(2014,9,8,10,22),
          latlng:"31.32,121.22"
        }
      ];
      orders.forEach(function(doc){
        steps.push(function(done){
          Order.insert(doc, done);
        });
      });
    });


    it("has order",function(done){
      var preorder_time = new Date(2014,9,8,8,42);
      var estimated_finish_time = new Date(2014,9,8,9,42);
      var fulltime = estimated_finish_time - new Date();
      steps.push(function(done){
        Order._adjustRests({
          worker:{
            _id: "1"
          },
          preorder_time: preorder_time,
          estimated_finish_time: estimated_finish_time
        },done);
      });
      async.series(steps,function(){
        async.series([
          function(done){
            Order.findOne({
              id:"b"
            },function(err, order){
              var actual = order.estimated_arrive_time.toString();
              var expected = new Date(orders[1].estimated_arrive_time - fulltime).toString();
              expect(actual).to.equal(expected);
              done();
            });
          }
        ],done);
      });
    });
  });

});