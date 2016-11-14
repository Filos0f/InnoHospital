var fs 		= require('node-fs');
//COPYPAST///////////////////////////////
var config 		= require('../config');
var pg 			= require('pg');
var md5 		= require('js-md5');
var dataBase 	= require('../libs/dbManagement');
////////////////////////////////////////

exports.staffInfo = function(req,res){

	console.log("-------------LOG Info-----------");
	res.render('staffMyInfo');
};

exports.staff = function(req, res) {
	console.log("------------- Staff init -----------");

	var analizesTitle = JSON.parse(fs.readFileSync("/home/lida/GITALL/InnoHospital/title_of_analizis", "utf8"));
	console.log("------------- Staff init 1-----------");

	var diagnosesType = JSON.parse(fs.readFileSync("/home/lida/GITALL/InnoHospital/type_of_diagnoses", "utf8"));
	console.log("------------- Staff init 2-----------");

	var analizesType = JSON.parse(fs.readFileSync("/home/lida/GITALL/InnoHospital/type_of_typeAnaliz", "utf8"));
	console.log("------------- Staff init 3-----------");
	var EmployeePositionsId = JSON.parse(fs.readFileSync("/home/lida/GITALL/InnoHospital/types_of_id_employee", "utf8"));
	console.log("------------- Staff init 4-----------");
	var allStaff = JSON.parse(fs.readFileSync("/home/lida/GITALL/InnoHospital/Staff.txt", "utf8"));

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

	const staff = dataBase.ConnectToDataBase();
	staff.connect();

	var sqlQuery = 'SELECT * from employee';
	const query = staff.query(sqlQuery);
	console.log(query);



	console.log(query.rows);
	const result = [];
	query.on('rows', function(row) {
		console.log(row);
		result.push(row);
	});

	query.on("end", function(result){

		console.log("------------------------------"+result[0]+"--------------------------");
		if(result[0] === undefined)
		{
			for(i = 0; i < EmployeePositionsId.length; i++)
			{
				staff.query(
					'INSERT INTO positions(idPos, title, idEmp) \
                    VALUES($1,$2,$3)',
					[EmployeePositionsId[i]['id'], EmployeePositionsId[i]['value'], null]);
			}
			console.log("------------- Staff AnalType-----------");

			for(i = 0; i < analizesType.length; i++)
			{
				staff.query(
					'INSERT INTO conclusiontypes(idtype, title) \
                    VALUES($1,$2)',
					[analizesType[i]['id'], analizesType[i]['value']]);
			}

			console.log("------------- Staff titleAnal-----------");
			for(i = 0; i < analizesTitle.length; i++)
			{
				staff.query(
					'INSERT INTO generalizedAnalysisTitles(idtitle, title) \
                    VALUES($1,$2)',
					[analizesTitle[i]['id'], analizesTitle[i]['value']]);
			}
			console.log("------------- Staff diagnoz -----------");

			for(i = 0; i < diagnosesType.length; i++)
			{
				staff.query(
					'INSERT INTO DiagnosisInfo(title, idtitle, nationalcode, rate) \
                    VALUES($1,$2, $3, $4)',
					[diagnosesType[i]['value'], (i + 1) * 999, diagnosesType[i]['id'], 0]);
			}


			for(i = 0; i < allStaff.length; i++)
			{
				console.log("------------- Staff table -----------");
				staff.query(
					'INSERT INTO person(idPassport,firstName,secondName,address,email,telN,birthDay,gender,hashPassword,hashSalt) \
                    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
					[allStaff[i]['People']['idPassport'], allStaff[i]['People']['firstName'], allStaff[i]['People']['secondName'], allStaff[i]['People']['address'], allStaff[i]['People']['email'], allStaff[i]['People']['telN'],
						allStaff[i]['People']['birthday'], allStaff[i]['People']['gender'], md5(allStaff[i]['People']['password'] + hash(allStaff[i]['People']['idPassport'])), hash(allStaff[i]['People']['idPassport'])]);

				staff.query(
					'INSERT INTO Employee(rating,idPos,idEmp,roomN,idPasport) \
                    VALUES($1,$2,$3,$4,$5)',
					[0, allStaff[i]['People']['Employee']['idPos'], allStaff[i]['People']['Employee']['idEmp'],
						allStaff[i]['People']['Employee']['roomN'], allStaff[i]['People']['idPassport']]
				);

				staff.query(
					'INSERT INTO WorkingSchedule(roomN,startTime, finishTime, day) \
                    VALUES($1,$2,$3,$4)',
					[allStaff[i]['People']['Employee']['WorkingSchedule']['roomN'], allStaff[i]['People']['Employee']['WorkingSchedule']['startTime'],
						allStaff[i]['People']['Employee']['WorkingSchedule']['finishTime'], allStaff[i]['People']['Employee']['WorkingSchedule']['date']]
				);
			}

			console.log("------------- Staff end -----------");

		}
	});
	res.render('staff');
};

exports.Input_information_for_patient = function(req,res){	
	res.render('Input_information_for_patient');
};

exports.StaffMain = function(req,res){
	console.log("-------------LOG Staff-----------");
	sess = req.session;
	sess.email = req.body.email;

	const staff = dataBase.ConnectToDataBase();
	console.log(req.body.hashpassword);

	var sqlQuery =
		'SELECT * from Person where email = \'' + req.body.email + '\'';

	console.log(sqlQuery);
	const query = staff.query(sqlQuery);
	console.log(query);

	const result = [];
	query.on('rows', function(row) {
		result.push(row);
	});
	console.log(sqlQuery);
	query.on("end", function(result){
		res.render('StaffMyInfo');
		if(result.rows[0] === undefined){
			res.render('StaffMain');
		}
		else{
			var hashsalt = result.rows[0].hashsalt;
			if(md5(req.body.hashpassword + hashsalt) == result.rows[0].hashpassword) {
				res.render('StaffMyInfo');
			}
			else {
				res.render('StaffMain');
			}
		}
	});
	console.log(sqlQuery);

};