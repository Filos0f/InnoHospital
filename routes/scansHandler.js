var fs 		= require('node-fs');
var pg 			= require('pg');
var dataBase 	= require('../libs/dbManagement');

exports.sendingScan = function (req, res) {
	var str = JSON.stringify(req.body).split('\"\\\"');
	console.log(str[1]);
	//console.log(JSON.stringify(req.body)[0]+JSON.stringify(req.body)[1]+JSON.stringify(req.body)[2]+
	//	JSON.stringify(req.body)[3]+JSON.stringify(req.body)[4]);
	fs=require("fs");
	fs.writeFileSync("txt.txt", str[1],  "ascii");
};