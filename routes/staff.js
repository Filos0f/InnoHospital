var fs 		= require('node-fs');
//COPYPAST///////////////////////////////
var config 		= require('../config');
var pg 			= require('pg');
var md5 		= require('js-md5');
var dataBase 	= require('../libs/dbManagement');
var async       = require('async');
////////////////////////////////////////

exports.staffInfo = function(req,res){

	console.log("-------------LOG Info-----------");
	res.render('staffMyInfo');
};

exports.staff = function(req, res) {
	console.log("------------- Staff init -----------");

	var analizesTitle = JSON.parse(fs.readFileSync("title_of_analizis", "utf8"));
	console.log("------------- Staff init 1-----------");

	var diagnosesType = JSON.parse(fs.readFileSync("type_of_diagnoses", "utf8"));
	console.log("------------- Staff init 2-----------");

	var analizesType = JSON.parse(fs.readFileSync("type_of_typeAnaliz", "utf8"));
	console.log("------------- Staff init 3-----------");
	var EmployeePositionsId = JSON.parse(fs.readFileSync("types_of_id_employee", "utf8"));

	console.log("------------- Staff init 4-----------");
	var allStaff = JSON.parse(fs.readFileSync("Staff.txt", "utf8"));

	console.log("------------- Staff hash -----------");
	function hash(key)
	{
		var h = 0;

		for (p = 0; p != key.length; p++) {
			h = h * 31 + key.charAt(p);
		}
		return h;
	}
	console.log("------------- Staff position -----------");
/*
	const staff = dataBase.ConnectToDataBase();
	staff.connect();

	var sqlQuery = 'SELECT * from positions';
	const query = staff.query(sqlQuery);
	console.log(query);



	console.log(query.rows);
	const result = [];
	query.on('rows', function(row) {
		console.log(row);
		result.push(row);
	});
*/
    async.series([
       function(callback) {
           const db = dataBase.ConnectToDataBase();
           db.connect();

		   var query = db.query( 'Select * from employee');
		   const result = [];
		   query.on('rows', function(row) {
			   result.push(row);
		   });

		   query.on("end", function(result) {
			   if (result.rows[0] === undefined) {
				   for(var y = 0; y < allStaff.length; y++)
				   {
					   db.query(
						   'INSERT INTO person(idPassport,firstName,secondName,address,email,telN,birthDay,gender,hashPassword,hashSalt) \
                          VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
						   [allStaff[y]['People']['idPassport'], allStaff[y]['People']['firstName'], allStaff[y]['People']['secondName'], allStaff[y]['People']['address'], allStaff[y]['People']['email'], allStaff[y]['People']['telN'],
							   allStaff[y]['People']['birthday'], allStaff[y]['People']['gender'],
							   md5(allStaff[y]['People']['password'] + hash(allStaff[y]['People']['idPassport'])),
							   hash(allStaff[y]['People']['idPassport'])]);

					   db.query(
						   'INSERT INTO Employee(rating,idPos,idEmp,roomN,idPassport) \
                          VALUES($1,$2,$3,$4,$5)',
						   ['0', allStaff[y]['People']['Employee']['idPos'], allStaff[y]['People']['Employee']['idEmp'],
							   allStaff[y]['People']['Employee']['roomN'], allStaff[y]['People']['idPassport']]
					   );

					   db.query(
						   'INSERT INTO WorkingSchedule(roomN,startTime, finishTime, day) \
                          VALUES($1,$2,$3,$4)',
						   [allStaff[y]['People']['Employee']['WorkingSchedule']['roomN'], allStaff[y]['People']['Employee']['WorkingSchedule']['startTime'],
							   allStaff[y]['People']['Employee']['WorkingSchedule']['finishTime'], allStaff[y]['People']['Employee']['WorkingSchedule']['date']]
					   );

				   }
				   for (var i = 0; i < EmployeePositionsId.length; ++i) {
					   console.log(i);
					   db.query(
						   'INSERT INTO positions(idPos, title, idEmp) \
                           VALUES($1,$2,$3)',
						   [EmployeePositionsId[i]['id'], EmployeePositionsId[i]['value'], null]
					   );
				   }
				   for(var k = 0; k < analizesType.length; ++k)
				   {
					   console.log(k);
					   db.query(
						   'INSERT INTO conclusiontypes(idtype, title) \
                               VALUES($1,$2)',
						   [analizesType[k]['id'], analizesType[k]['value']]
					   );
				   }
				   for(var m = 0; m < analizesTitle.length; ++m) {
					   for (var j = 0; j < analizesTitle[m]['value'].length; ++j) {
						   console.log(analizesTitle[m]['value'][j]['id'] + " " + analizesTitle[m]['value'][j]['title'] + " " + analizesTitle[m]['idType']);
						   db.query(
							   'INSERT INTO generalizedAnalysisTitles(idtitle, title, idType) \
                VALUES($1,$2, $3)',
							   [analizesTitle[m]['value'][j]['id'], analizesTitle[m]['value'][j]['title'], analizesTitle[m]['idType']]);
					   }
				   }
				   for(var t = 0; t < diagnosesType.length; t++)
				   {
					   var id = (t + 1) * 999;
					   db.query(
						   'INSERT INTO DiagnosisInfo(title, idtitle, nationalcode, rate) \
                          VALUES($1,$2, $3, $4)',
						   [diagnosesType[t]['value'], id, diagnosesType[t]['id'], '0']);
				   }
			   }
		   });
       }
    ], function (err) {
        if(err) callback(err);
    });

	res.render('staff');
};

exports.Input_information_for_patient = function(req,res){	
	res.render('Input_information_for_patient');
};

exports.staffMain = function(req,res){
	console.log("-------------LOG Staff-----------");
	sess = req.session;
	sess.email = req.body.email;

	const staff = dataBase.ConnectToDataBase();
	staff.connect();
	console.log(req.body.hashpassword);

	var sqlQuery =
	 	'SELECT * from person';

	const query = staff.query(sqlQuery);
	console.log(sqlQuery);

	const result = [];
	query.on('fields', function(fields) {
		console.log(result);

		result.push(fields);
	});
	console.log(sqlQuery);

	query.on("end", function(result){
		console.log(result);
		if(result.fields[0] === undefined){
			res.render('staffMain');
		}
		else{
			var hashsalt = result.fields[0].hashsalt;
			if(md5(req.body.hashpassword + hashsalt) == result.fields[0].hashpassword) {
				res.render('staffMyInfo');
			}
			else {
				console.log("error2");
				res.render('staffMain');
			}
		}
	});
	console.log(sqlQuery);
};