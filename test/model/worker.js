var worker = require('../../model/worker');
var order = require('../../model/order');
var async = require('async');
var assert = require('chai').assert;
var expect = require('chai').expect;

if(process.env.NODE_ENV !== "test"){
  console.log("please set NODE_ENV to test");
  process.exit(1);
}

describe('worker',function(){

});