var fs 		= require('node-fs');
var config 		= require('../config');
var pg 			= require('pg');
var md5 		= require('js-md5');
var dataBase 	= require('../libs/dbManagement');
var async       = require('async');
var mymailer 	= require('./mymailer');

function LoadStaffInformation(res, email, patientHandler) {
	var results = [];
	var appointmentInfo = [];
	var epedemy = [];
	var rating = [];
	async.series([
		function(callback) {
			const client = dataBase.ConnectToDataBase();
			client.connect();
			console.log("FIRST CALLBACK! " + email);
    		var sqlQuery = 
			'SELECT * from person \
			NATURAL JOIN employee \
			where email = \'' + email + '\'';
    		const query = client.query(sqlQuery);
    		query.on('row', function(row) {
    			console.log("FIRST QUERY!");
		    	results.push(row);
		    });  
		    query.on("end", function(result){
		    	callback();
		    	client.end();
		    });
		},
		function(callback) {
			const client = dataBase.ConnectToDataBase();
			client.connect();
			var sqlQuery = 'select p.idip, v.day, v.starttime, per.firstname, per.secondname\
							from patient p\
							natural join visitschedule v \
							natural join person per \
							where idemp=\'' + results[0].idemp +'\''; 
			console.log(sqlQuery);

			const query = client.query(sqlQuery);
			query.on('row', function(row){
		    	appointmentInfo.push(row);
		    });
		    query.on("end", function(result){
		    	callback();
		    	client.end();
		    });
		},
		function(callback) {
			const client = dataBase.ConnectToDataBase();
			client.connect();
			var sqlQuery = 'select p.title, per.firstname, per.secondname, rating\
							from employee\
							natural join person per\
							natural join positions p\
							order by rating';
			console.log(sqlQuery);

			const query = client.query(sqlQuery);
			query.on('row', function(row){
				rating.push(row);
			});
			query.on("end", function(result){
				callback();
				client.end();
			});
		},
		function(callback) {
			const client = dataBase.ConnectToDataBase();
			client.connect();
			var sqlQuery = 'select title, rate from DiagnosisInfo\
								order by rate';
			console.log(sqlQuery);

			const query = client.query(sqlQuery);
			query.on('row', function(row){
				epedemy.push(row);
			});
			query.on("end", function(result){
				callback();
				client.end();
			});
		},

		function(callback) {
			patientHandler(results, appointmentInfo, epedemy, rating);
		},
		],
		function(err) {
			if (err) return callback(err);
	    	console.log('Both finished!');
	});
}

exports.staffInfo = function(req,res){ //пилит федя
	//вывод информации о стафе
	console.log("-------------LOG Info-----------");
	res.render('staffMyInfo');
}



exports.staffInfo = function(req, res, next){
    console.log("-------------staffMyInfo start-----------");
    sess = req.session;
    email = sess.email;
    //console.log("1 - Email session - " + sess.email);
    if(sess.email) {
        console.log("Check E-mail - " + sess.email);
        //LoadStaffInformation(res, sess.email, function(results) {
        var results = [];
        const client = dataBase.ConnectToDataBase();
        client.connect();
        console.log("before start query");

        var sqlQuery =
        'SELECT * from person \
        NATURAL JOIN employee \
        natural join positions \
        where email = \'' + email + '\'';

        const query = client.query(sqlQuery);
        query.on('row', function(row) {
            console.log("after query + sqlquery and resul: " + sqlQuery + '\n' + row);
            results.push(row);
        });
        query.on("end", function(result){
            client.end();
            res.render('staffMyInfo', {employee:results[0],positions:results})

        });
        //});
        console.log("3 - Email session - " + sess.email);
    }
    console.log("-------------staffMyInfo end-----------");
    //res.render('staffMyInfo');
};

exports.staff = function(req, res) {

    console.log("------------- Staff init -----------");

    res.render('staff');
};

exports.Input_information_for_patient = function(req,res){
	console.log(req.body.fname);
	console.log(req.body.SecondNameTitle);
    res.render('Input_information_for_patient');
};

exports.StaffMain = function(req,res) {
    sess = req.session;
    sess.email = req.body.email;
	if(sess.email != null) {
        LoadStaffInformation(res, sess.email, function (results, appointmentInfo, epidemy, rating) {
            console.log(appointmentInfo);
            console.log(epidemy);
            console.log(rating);
            res.render('staffMain', {patientappointment: appointmentInfo, epidemy: epidemy, rating: rating});
        });
    }
    console.log("OHH");
	res.render('staffMain');
};


/*Авторизация врача*/
exports.signinStaff = function (req, res) {
    console.log("-------------LOG signinStaff-----------");
    sess = req.session;
    sess.email = req.body.email;

    const staff = dataBase.ConnectToDataBase();
    staff.connect();
    console.log(req.body.hashpassword);

	function hash(key) {
		for (p = 0; p != key.length; p++) {
			h = h * 31 + key.charAt(p);
		}
		return h;
	};
	console.log("------------- Staff position -----------");

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
				   for (var i = 0; i < EmployeePositionsId.length; ++i) {
					   console.log(i);
					   db.query(
						   'INSERT INTO positions(idPos, title) \
                           VALUES($1,$2)',
						   [EmployeePositionsId[i]['id'], EmployeePositionsId[i]['value']]
					   );
				   }

				   for(var y = 0; y < allStaff.length; y++)
				   {
					   db.query(
						   'INSERT INTO person(idPassport,firstName,secondName,address,email,telN,birthDay,gender,hashPassword,hashSalt) \
                          	VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
							   [allStaff[y]['People']['idPassport'], allStaff[y]['People']['firstName'], allStaff[y]['People']['secondName'], 
							   allStaff[y]['People']['address'], allStaff[y]['People']['email'], allStaff[y]['People']['telN'],
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
							   [allStaff[y]['People']['Employee']['WorkingSchedule']['roomN'],
							   allStaff[y]['People']['Employee']['WorkingSchedule']['startTime'],
							   allStaff[y]['People']['Employee']['WorkingSchedule']['finishTime'],
							   allStaff[y]['People']['Employee']['WorkingSchedule']['date']]
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
    console.log(sqlQuery);
	res.render('staff');
};

exports.newAppointment = function(req, res){
	sess = req.session;
	if(sess.idip) {
		var results = [];
		async.series([
			function(callback) {
				const client = dataBase.ConnectToDataBase();
				client.connect();
	    		var sqlQuery = 'SELECT idemp from employee \
	    						NATURAL JOIN person p\
	    						where idpos = \'' + req.body.doctor + '\' \
								and p.secondname = \'' + req.body.doctorName + '\'';
				const query = client.query(sqlQuery);
				query.on('row', function(row) {
			    	results.push(row);
			    });
			    query.on("end", function(result) {
			    	callback();
			    	client.end();
			    });
			},
			function(callback) {
				const client = dataBase.ConnectToDataBase();
				client.connect();
				var employeeID = results[0].idemp;
				var query = client.query(
				'INSERT INTO visitschedule(day,startTime,offsetTime,evoluation,idIp,idEmp) \
				VALUES($1,$2,$3,$4,$5,$6)',
				[req.body.date,req.body.time,'00:30',false, sess.idip,employeeID]);
                query.on("end", function(result) {
                    callback();
                    client.end();
                });
			},
			function (callback) {
				const client = dataBase.ConnectToDataBase();
				client.connect();
				var sqlQuery = 'SELECT email from patient \
	    						NATURAL JOIN person \
	    						where idip = \'' + sess.idip + '\'';
				const query = client.query(sqlQuery);
				query.on('row', function(row) {
					results.push(row);
				});
				query.on("end", function(result) {
					var patientMail = results[0].email;
					var roomN = 108; // сюда номер комнаты!
					var message = "Добрый день! \n Вы записаны к врачу: " + req.body.doctorName+ " " + req.body.doctor
						+" на " + req.body.date + " " + req.body.time + " кабинет: " + roomN;
					console.log("Maile sender, message: " + message + " to email: " + patientMail);
					mymailer.SendNotification(patientMail, message);
					client.end();
				});
			}
			],
			function(err) {
				console.log('ERROR');
				if (err) return callback(err);
		    	console.log('Both finished!');
		});
	}
    res.render('Input_information_for_patient');
};

exports.Input_information_for_patient = function(req,res){	
	sess = req.session;
    email = sess.email; 
    const client = dataBase.ConnectToDataBase();
	client.connect();
	var now = new Date();
	//var time = (now.getHours() - (now.getMinutes() > '40:00' ? 1 : - 1)) + ':00';
	var sqlQuery = 'select idip from visitschedule\
					where day > \'' + getDate(0, 1) + '\'';
	const query = client.query(sqlQuery);
	var results = [];
	query.on('row', function(row) {
    	results.push(row);
    });
	query.on("end", function(result) {
		sess.idip = results[0].idip;
    	client.end();
    });

	var positionsRet = [];
	var nameofempRet = [];
	var diagnosisRet = [];
	var typeXrayRet  = [];
	var scansRet 	 = [];
	var labtypesRet	 = [];

    async.series([
    	function(callback) {
			const client = dataBase.ConnectToDataBase();
			client.connect();
    		var sqlQuery = 'SELECT * from positions'; 
			const query = client.query(sqlQuery);
			query.on('row', function(row){
		    	positionsRet.push(row);
		    });
		    query.on("end", function(result){
		    	callback();
		    	client.end();
		    });
		},
	  	function(callback) {
            const client = dataBase.ConnectToDataBase();
            client.connect();
            var sqlQuery = 'SELECT firstname, secondname, p.idpos from employee NATURAL JOIN person NATURAL JOIN positions p';
            const query = client.query(sqlQuery);
            query.on('row', function(row) {
                nameofempRet.push(row);
            });
            query.on("end", function(result) {
                callback();
                client.end();
            });
        },
        function(callback) {
            const client = dataBase.ConnectToDataBase();
            client.connect();
            var sqlQuery = 'SELECT * FROM DiagnosisInfo';
            const query = client.query(sqlQuery);
            query.on('row', function(row) {
                diagnosisRet.push(row);
            });
            query.on("end", function(result) {
                callback();
                client.end();
            });
        },
        function(callback) {
        	const client = dataBase.ConnectToDataBase();
            client.connect();
            var sqlQuery = 'SELECT * FROM generalizedAnalysisTitles \
							WHERE idtype = \'2\'';
            const query = client.query(sqlQuery);
            query.on('row', function(row) {
                typeXrayRet.push(row);
            });
			query.on("end", function(result) {
                callback();
                client.end();
            });
		},
		function(callback) {
        	const client = dataBase.ConnectToDataBase();
            client.connect();
            var sqlQuery = 'SELECT day, scan, description from xray\
							NATURAL JOIN conclusion\
							NATURAL JOIN result\
							WHERE idip = \''+results[0].idip+'\'';
            const query = client.query(sqlQuery);
            query.on('row', function(row) {
                scansRet.push(row);
            });
			query.on("end", function(result) {
                callback();
                client.end();
            });
		},
		function(callback) {
        	const client = dataBase.ConnectToDataBase();
            client.connect();
            var sqlQuery = 'SELECT title, result from generalizedAnalysis \
							NATURAL JOIN conclusion\
							NATURAL JOIN ConclusionTypes \
							NATURAL JOIN result\
							NATURAL JOIN patient\
							WHERE idip =\''+results[0].idip+'\'';
            const query = client.query(sqlQuery);
            query.on('row', function(row) {
                scansRet.push(row);
            });
			query.on("end", function(result) {
                callback();
                client.end();
            });
		},
		function(callback) {
        	const client = dataBase.ConnectToDataBase();
            client.connect();
            var sqlQuery = 'SELECT * FROM generalizedAnalysisTitles';
            const query = client.query(sqlQuery);
            query.on('row', function(row) {
                labtypesRet.push(row);
            });
			query.on("end", function(result) {
                callback();
                client.end();
            });
		},
        function(callback) {
			res.render('Input_information_for_patient',
				{diagnosisInformation:diagnosisRet,
					positions:positionsRet,
					nameofemp:nameofempRet,
					scanstype:typeXrayRet,
					scans:scansRet,
					labtypes:labtypesRet});
		},
    	],
		function(err) {
			if (err) return callback(err);
	    	console.log('Both finished!');
	});
	console.log(positionsRet);
	console.log(nameofempRet);
	
	//при нажатии на апоимент
};

exports.staffMain = function(req,res) { //Fedy
	console.log("-------------Staff Cabinet-----------");
	//все апойманты на сегодня
};

exports.declineAppointment = function(req, res) {
	const client = dataBase.ConnectToDataBase();
	client.connect();

	//client.query('DELETE FROM visitschedule WHERE ');
};

function getDate(inc, dec) {
	var now = new Date();
	var month = now.getMonth() + 1;
	var day = now.getDate() + inc - dec;
	var year = now.getFullYear();
	return year + "-" + month + "-" + day;
}

exports.submitAD = function(req, res) {
	console.log(getDate(0, 0));
	console.log(req.body.Anamnesis);
	console.log(req.body.Diagnosis);
}

exports.submitScans = function(req, res) {
	sess = req.session;
	const client = dataBase.ConnectToDataBase();
	client.connect();
	async.series([
		function(callback) {
            var sqlQuery = 'INSERT INTO conclusion VALUES(\''+ req.body.scantype +'\', (SELECT COUNT(*)+1 FROM conclusion))';
            const query = client.query(sqlQuery);
			query.on("end", function(result) {
                callback();
            });
		},
		function(callback) {
            var sqlQuery = 'INSERT INTO result VALUES(\''+ getDate(0, 0)+ '\', '+req.session.idip+', \''
					+ '(SELECT idemp FROM employee NATURAL JOIN person where email=\''+sess.email+')\', (SELECT COUNT(*) FROM conclusion))';
            const query = client.query(sqlQuery);
			query.on("end", function(result) {
                callback();
            });
		},
		function(callback) {
            var sqlQuery = 'INSERT INTO xray VALUES(\''+'scan'+'\', \''+req.body.conclusion+'\', (SELECT COUNT(*) FROM conclusion))';
            const query = client.query(sqlQuery);
			query.on("end", function(result) {
                callback();
                client.end();
            });
		},
		],
		function(err) {
			if (err) return callback(err);
	    	console.log('Both finished!');
	});
}

exports.submitLabResult = function(req, res) {
	sess = req.session;
	const client = dataBase.ConnectToDataBase();
	client.connect();
	async.series([
		function(callback) {
            var sqlQuery = 'INSERT INTO conclusion VALUES(\''+ req.body.analystype +'\', (SELECT COUNT(*)+1 FROM conclusion))';
            const query = client.query(sqlQuery);
			query.on("end", function(result) {
                callback();
            });
		},
		function(callback) {
            var sqlQuery = 'INSERT INTO result VALUES(\''+ getDate(0, 0)+ '\', '+req.session.idip+', \''
					+ '(SELECT idemp FROM employee NATURAL JOIN person where email=\''+sess.email+')\', (SELECT COUNT(*) FROM conclusion))';
            const query = client.query(sqlQuery);
			query.on("end", function(result) {
                callback();
            });
		},
		function(callback) {
            var sqlQuery = 'INSERT INTO generalizedAnalysis VALUES(\''+
					'(SELECT idTitle FROM generalizedAnalysisTitles where title=\''+req.body.analystype+'\')'
					+'\',(SELECT COUNT(*) FROM conclusion),\''+req.body.result+'\','+req.body.standart+')\'';
            const query = client.query(sqlQuery);
			query.on("end", function(result) {
                callback();
                client.end();
            });
		},
		],
		function(err) {
			if (err) return callback(err);
	    	console.log('Both finished!');
	});
}

/*Авторизация врача*/
exports.signinStaff = function (req, res) {
	console.log("-------------LOG signinStaff-----------");
	sess = req.session;
	    sess.email = req.body.email;

        const staff = dataBase.ConnectToDataBase();
        staff.connect();
        console.log(req.body.hashpassword);
        var sqlQuery =
            'SELECT * from person \
            NATURAL JOIN employee \
            where email = \'' + req.body.email + '\'';

        const query = staff.query(sqlQuery);
        console.log(sqlQuery);

        const result = [];
        query.on('rows', function (row) {
            console.log("------!!!!!!!!!--------" + row);
            result.push(row);
        });
        console.log(sqlQuery);

        query.on("end", function (result) {
            if (result.rows[0] === undefined) {
                res.render('staff');
            } else {
                var hashsalt = result.rows[0].hashsalt;
                if (md5(req.body.hashpassword + hashsalt) == result.rows[0].hashpassword) {
                    LoadStaffInformation(res, sess.email, function (results, appointmentInfo, epidemy, rating) {
                        console.log(appointmentInfo);
                        console.log(epidemy);
                        console.log(rating);
                        res.render('staffMain', {
                            patientappointment: appointmentInfo,
                            epidemy: epidemy,
                            rating: rating
                        });
                    });

                }
                else {
                    console.log("error2");
                    res.render('staff');
                }
            }
            staff.end();
        });
};

exports.fillTheEpidemicBox = function (req, res) {
    /*Fill the epidemic box in staffMain page*/
    console.log("______FillTheEpidemicBox_______");
};

exports.showRatingBox = function (req, res) {
    /*staffMain, 'rating' ref*/
    console.log("______showRatingBox_______");
};

exports.saveAnamAndDiag = function (req, res) {
    /*Input_information_for_patient Anamnesis&Diagnosis*/
    console.log("______save Anamnesis&Diagnosis");
};

exports.labResultDone = function (req, res) {
    /*In input_inform_for_patient, in Lab result box, button 'DONE'*/
    Console.log('______LabResultsDone_______');
};

exports.scanSave = function (req, res) {
    /*Save scan from input_blablabla_patient page*/
    COnsole.log("______SaveScans_____________");
};

exports.createNewAppointment = function (req, res) {
    /*createNewAppointment on input_info_for_patient page when click button save in NewAppointment box*/
    Console.log("createNewAppointment");
};