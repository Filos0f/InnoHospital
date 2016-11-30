var fs 		= require('node-fs');
var pg 			= require('pg');
var dataBase 	= require('../libs/dbManagement');
/*
function saveImage(base64string) {
        var imageData = base64string.split(',')[1];
        var a = $("<a>").attr("href", "data:Application/base64," + imageData )
                        .attr("download","image.png")
                        .appendTo("body");

        a[0].click();
        a.remove();
}
*/
exports.sendingScan = function (req, res) {
	console.log(JSON.stringify(req.body));
	//saveImage(JSON.stringify(req.body));

	fs=require("fs");
	fs.writeFileSync("txt.txt", JSON.stringify(req.body),  "ascii");

};