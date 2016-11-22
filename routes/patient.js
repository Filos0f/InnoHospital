var dataBase 	= require('../libs/dbManagement');
var md5 		= require('js-md5');
var async 		= require('async');

exports.patient = function(req, res){
	console.log("------------- PATIENT -----------");
	res.render('patient');
};

function LoadPatientInformation(res, email, patientHandler) {	
	var results = [];
	var appointmentInfo = [];
	var rating = [];
	var nameOfEmp = [];
	async.series([
		function(callback) {
			const client = dataBase.ConnectToDataBase();
			client.connect();
			console.log("FIRST CALLBACK!");
    		var sqlQuery = 
			'SELECT * from person \
			NATURAL JOIN patient \
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
    		var sqlQuery = 'SELECT * from positions'; 
			const query = client.query(sqlQuery);
			query.on('row', function(row){
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
                var sqlQuery = 'SELECT firstname, secondname, p.idpos from employee NATURAL JOIN person NATURAL JOIN positions p';
                const query = client.query(sqlQuery);
                query.on('row', function(row) {
                    nameOfEmp.push(row);
                });
                query.on("end", function(result) {
                    console.log("Here 1");
                    callback();
                    client.end();
                });
            },
		function(callback) {
			const client = dataBase.ConnectToDataBase();
			client.connect();
			console.log("Ya zawel")
    		var sqlQuery = 'select firstname, secondname, roomn, title, day, starttime, offsettime, teln \
    		from  visitschedule\
				natural join employee \
				natural join positions \
				natural join person\
				where idip=\'' + results[0].idip +'\''; 

			const query = client.query(sqlQuery);
			query.on('row', function(row){
				console.log("Row added");
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
			patientHandler(results, appointmentInfo, rating, nameOfEmp);
		},
		],
		function(err) {
			if (err) return callback(err);
	    	console.log('Both finished!');
	});
}

exports.get_patient_cabinet = function(req, res){
	console.log("------------- PATIENT CAB -----------");
	sess = req.session;
	console.log("Email session - " + sess.email);
	if(sess.email) {
		LoadPatientInformation(res, sess.email, function(results, appointmentInfo, rating, nameofemp) {
			res.render('patient_cabinet', {patient:results[0],positions:results,appointment:appointmentInfo,rating:rating, nameofemp:nameofemp})
		});
	}
};

exports.post_patient_cabinet = function(req, res, next){
	console.log("-------------LOG -----------");
	sess = req.session;
	sess.email=req.body.email;
	const client = dataBase.ConnectToDataBase();

	client.connect();

	var sqlQuery = 
	'SELECT * from person \
	NATURAL JOIN patient \
	where email = \'' + req.body.email + '\'';
	console.log(sqlQuery);

	const query = client.query(sqlQuery);
    const result = [];
    query.on('rows', function(row) {
		result.push(row);
    });

    query.on("end", function(result){
    	LoadPatientInformation(res, sess.email, function(results, appointmentInfo, rating, nameofemp) {
			if(result.rows[0] === undefined){
		    	res.redirect('/patient');
			}
			else{
			    var hashsalt = result.rows[0].hashsalt;
			    if(md5(req.body.hashpassword + hashsalt) == result.rows[0].hashpassword) {
					res.render('patient_cabinet', {patient:results[0],positions:results,appointment:appointmentInfo, rating:rating, nameofemp:nameofemp})
			    }
			    else {
					//not right password or email
					res.redirect('/patient');
			    }
			}
		});
		client.end();
    });

    console.log('--------This----------' + result);
};

exports.registration = function(req, res){
	console.log("------------- REGISTRATION -----------");
	res.render('registration');
};

exports.addPatient = function(req,res){

	console.log("-------------ADD -----------");
	console.log(req.body.gridRadios);

	const client = dataBase.ConnectToDataBase();
	client.connect();

	function hash(key)
	{
	    var h = 0;
	    
	    for (p = 0; p != key.length; p++) {
    		h = h * 31 + key.charAt(p);
	    }
	    return h;
	}
	var hashSolt = hash(req.body.passport);

	console.log('------hashSolt-------' + hashSolt);
	console.log(req.body.hashpassword);
	console.log(md5(req.body.hashpassword + hashSolt));

	console.log(req.body.fname);

	var address=req.body.city+ ' ' + req.body.street+ ' ' + req.body.appartment;
	client.query(
		'INSERT INTO person(idPassport,firstName,secondName,address,email,telN,birthDay,gender,hashPassword,hashSalt) \
		VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
		[req.body.passport, req.body.fname, req.body.sname, address, req.body.email, req.body.phone,
		req.body.birthdate, req.body.gridRadios, md5(req.body.hashpassword + hashSolt), hashSolt]);

	client.query(
		'INSERT INTO patient(idip,telfamily,idPassport) VALUES($1,$2,$3)',
		[req.body.insurance, req.body.telfamily, req.body.passport]);

	res.redirect('/patient');
};

exports.newAppointment = function(req, res){
	sess = req.session;
	if(sess.email) {
		var results = [];
		var nameOfEmp = [];
		async.series([
			function(callback) {
				const client = dataBase.ConnectToDataBase();
				client.connect();
	    		var sqlQuery = 'SELECT idip from patient NATURAL JOIN person \
								where email = \'' + sess.email + '\'';
	    		const query = client.query(sqlQuery);
	    		query.on('row', function(row) {
			    	results.push(row);
			    });  
			    query.on("end", function(result) {
			    	console.log("Here 1");
			    	callback();
			    	client.end();
			    });
			},
			function(callback) {
				const client = dataBase.ConnectToDataBase();
				client.connect();
	    		var sqlQuery = 'SELECT idemp from employee \
	    						NATURAL JOIN person \
	    						where idpos = \'' + req.body.doctor + '\''; 
				const query = client.query(sqlQuery);
				query.on('row', function(row) {
			    	results.push(row);
			    });
			    query.on("end", function(result) {
			    	console.log("Here 2");
			    	callback();
			    	client.end();
			    });
			},
			function(callback) {
				const client = dataBase.ConnectToDataBase();
				client.connect();
				var patientIP = results[0].idip;
				var employeeID = results[1].idemp;
				client.query(
				'INSERT INTO visitschedule(day,evoluation,idEmp,idIp,offsetTime,startTime) \
				VALUES($1,$2,$3,$4,$5,$6)',
				[req.body.date,false, employeeID, patientIP, '00:30', req.body.time]);
				client.end();
			},
			],
			function(err) {
				console.log('ERROR');
				if (err) return callback(err);
		    	console.log('Both finished!');
		});
	}
};

exports.medCard = function(req, res){
	res.render('patientCard');
};

exports.scans = function(req, res){
	res.render('scans');
};

exports.analysis = function(req, res){
	res.render('patientAnalysis');
};


