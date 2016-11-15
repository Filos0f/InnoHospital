var dataBase 	= require('../libs/dbManagement');
var md5 		= require('js-md5');
var async = require('async');

exports.patient = function(req, res){
	console.log("------------- PATIENT -----------");
	res.render('patient');
};

exports.get_patient_cabinet = function(req, res){
	console.log("------------- PATIENT CAB -----------");
	sess = req.session;
	console.log("Email session - " + sess.email);
	if(sess.email) {
		const client = dataBase.ConnectToDataBase();
		client.connect();
		
		var results = [];
		async.series([
			function(callback) {
				console.log("FIRST CALLBACK!");
        		var sqlQuery = 
				'SELECT * from person \
				NATURAL JOIN patient \
				where email = \'' + req.body.email + '\'';
        		var sqlQuery = 'SELECT * from person where email = \'' + sess.email + '\'';
        		const query = client.query(sqlQuery);
        		query.on('row', (row) => {
        			console.log("FIRST QUERY!");
			    	results.push(row);
			    });  
			    query.on("end", function(result){
			    	callback();
			    });
    		},
    		function(callback) {
        		var sqlQuery = 'SELECT * from positions'; 
				const query = client.query(sqlQuery);
				query.on('row', (row) => {
			    	results.push(row);
			    });
			    query.on("end", function(result){
			    	callback();
			    });
    		},
    		function(callback) {
    			res.render('patient_cabinet', {patient:results[0],positions:results})
    		},
    		],
    		function(err) {
    			if (err) return callback(err);
		    	console.log('Both finished!');
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
		if(result.rows[0] === undefined){
		    res.redirect('/patient');
		}
		else{
		    var hashsalt = result.rows[0].hashsalt;
		    if(md5(req.body.hashpassword + hashsalt) == result.rows[0].hashpassword) {
				res.render('patient_cabinet', {patient:result.rows});
		    }
		    else {
				//not right password or email
				res.redirect('/patient');
		    }
		}
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
	console.log(req.body.date);
	console.log(req.body.time);
	console.log(req.body.doctor);
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


