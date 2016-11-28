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
							where idemp=\'' + results[0].idemp +'\'' +
							'order by v.day, v.starttime';
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

/*
exports.Input_information_for_patient = function(req,res){

	//console.log(req.body.fname);
	//console.log(req.body.SecondNameTitle);
    res.render('Input_information_for_patient');
};
*/
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
exports.staff = function(req, res) {
    console.log("------------- Staff init -----------");

    var analizesTitle = JSON.parse(fs.readFileSync("title_of_analizis", "utf8"));
    console.log("------------- Staff init 1-----------");
    var diagnosesType = JSON.parse(fs.readFileSync("type_of_diagnoses", "utf8"));
    console.log("------------- Staff init 3-----------");
    var EmployeePositionsId = JSON.parse(fs.readFileSync("types_of_id_employee", "utf8"));
    console.log("------------- Staff init 4-----------");
    var allStaff = JSON.parse(fs.readFileSync("Staff.txt", "utf8"));


    console.log("------------- Staff init -----------");

    const staff = dataBase.ConnectToDataBase();
    staff.connect();

	function hash(key) {
		var h = 0;
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
				   for(var k = 0; k < analizesTitle.length; ++k)
				   {
					   console.log(k);
					   db.query(
						   'INSERT INTO conclusiontypes(idtitle, title) \
                               VALUES($1,$2)',
						   [analizesTitle[k]['id'], analizesTitle[k]['title']]
					   );
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

exports.newAppointment = function(req, res){
	sess = req.session;
 
	if(sess.idip) {
		var results = [];
		var doctorInfRet = [];
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
				var sqlQuery = 'select title,roomn\
									from person natural join employee natural join positions\
									where idpos=\''+req.body.doctor+'\' and secondname=\''+req.body.doctorName+'\'';
				const query = client.query(sqlQuery);
				
				query.on('row', function(row) {
					doctorInfRet.push(row);
					 
					
				});
				query.on("end", function(result) {
					 
					 callback();

					 client.end();
				});
			},

			function (callback) {
				results = [];
				const client = dataBase.ConnectToDataBase();
				client.connect();
				var sqlQuery = 'SELECT email FROM patient \
	    						NATURAL JOIN person \
	    						WHERE idip = \'' + sess.idip + '\'';
				const query = client.query(sqlQuery);
				query.on('row', function(row) {
					results.push(row);
					
				});
				query.on("end", function(result) {
					console.log("idip: " + sess.idip + "\n" + "results: " + results);
					for(var i =0; i<results.length; i++) {
						console.log(results[0].email);
						for(var j=0; j<results[i].length; j++) {
							console.log(results[i][j]);
						}
					}
					var patientMail = results[0].email;
					var roomN = doctorInfRet[0].roomn; // сюда номер комнаты!
					var message = "Добрый день! \n Вы записаны к врачу: " + req.body.doctorName+ " " + doctorInfRet[0].title
						+" на " + req.body.date + " " + req.body.time + " кабинет: " + roomN;
					console.log("Mail sender, message: " + message + " to email: " + patientMail);
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
            var sqlQuery = 'SELECT * FROM conclusiontypes \
							WHERE idtitle > \'200\' AND idtitle < \'300\'';
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
            var sqlQuery = 'SELECT title, result from ConclusionTypes \
							NATURAL JOIN conclusion\
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

            var sqlQuery = 'SELECT * FROM conclusiontypes';
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
};

exports.submitScans = function(req, res) {
	sess = req.session;
	const client = dataBase.ConnectToDataBase();
	client.connect();
	var idEmpRet = [];
	async.series([
		function(callback) {
            var sqlQuery = 'INSERT INTO conclusion VALUES(\''+ req.body.scantype +'\', (SELECT COUNT(*)+1 FROM conclusion))';
            const query = client.query(sqlQuery);
			query.on("end", function(result) {
                callback();
            });
		},
		function(callback) {
            var sqlQuery = 'SELECT idemp FROM employee NATURAL JOIN person where email=\''+sess.email+'\'';
            const query = client.query(sqlQuery);
            query.on("on", function(result) {
            	console.log('HERE');
            	idEmpRet.push(result);
            });
			query.on("end", function(result) {
                callback();
            });
		},
		function(callback) {
            var sqlQuery = 'INSERT INTO result VALUES(\''+ getDate(0, 0)+ '\', '
            +req.session.idip+', \''
			+ idEmpRet.idEmp+ ', (SELECT COUNT(*) FROM conclusion))';
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
	var idempRet = [];
	async.series([
		function(callback) {
			console.log("First " + req.body.analystype);
            var sqlQuery = 'INSERT INTO conclusion VALUES(\''+ req.body.analystype +'\', (SELECT COUNT(*)+1 FROM conclusion))';
            const query = client.query(sqlQuery);
			query.on("end", function(result) {
				console.log("First query");
                callback();
            });
		},
		function(callback) {
            var curEmail = sess.email;
            console.log("Email - " + sess.email);
			var sqlQuery = 'SELECT idemp FROM employee NATURAL JOIN person where email=\''+curEmail+'\'';
			const query = client.query(sqlQuery);
			query.on("row", function(row) {
                console.log("HERE " + row.idemp + " " + row);
                idempRet.push(row);
			});
			query.on("end", function(result) {

				callback();
			});
		},
		function(callback) {
			var curEmail = sess.email;
            console.log("Second" + getDate(0, 0) + " " + req.session.idip + " " + curEmail);
            console.log(idempRet[0].idemp);
            var sqlQuery = 'INSERT INTO result VALUES(\''+ getDate(0, 0)+ '\', \''+ req.session.idip +'\','
					+ idempRet[0].idemp+', (SELECT COUNT(*) FROM conclusion))';
            console.log(sqlQuery);
            const query = client.query(sqlQuery);
			query.on("end", function(result) {
                console.log("Second query");
                callback();
            });
		},
		function(callback) {
            console.log("third");
            var sqlQuery = 'INSERT INTO generalizedAnalysis VALUES(\
            (SELECT COUNT(*) FROM conclusion),'
            +req.body.result+',\''+req.body.standart+'\')';
            const query = client.query(sqlQuery);
			query.on("end", function(result) {
                console.log("Threed query");
                client.end();
            });
		},
		],
		function(err) {
			if (err) return callback(err);
	    	console.log('Both finished!');
	});
};

/*Авторизация врача*/
exports.signinStaff = function (req, res) {
	console.log("-------------LOG signinStaff-----------");
	sess = req.session;
	    sess.email = req.body.email;
	    console.log("Save email - " + sess.email);

        const staff = dataBase.ConnectToDataBase();
        staff.connect();
        console.log(req.body.hashpassword);
        var sqlQuery =
            'SELECT * from person \
            NATURAL JOIN employee \
            where email = \'' + req.body.email + '\'';

        const query = staff.query(sqlQuery);
        //console.log(sqlQuery);

        const result = [];
        query.on('rows', function (row) {
            //console.log("------!!!!!!!!!--------" + row);
            result.push(row);
        });
        //console.log(sqlQuery);

        query.on("end", function (result) {
            if (result.rows[0] === undefined) {
                res.render('staff');
            } else {
                var hashsalt = result.rows[0].hashsalt;
                if (md5(req.body.hashpassword + hashsalt) == result.rows[0].hashpassword) {
                    LoadStaffInformation(res, sess.email, function (results, appointmentInfo, epidemy, rating) {
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
