var express=require('express'),
var session = require('express-session'),
path=require('path'),
bodyParser=require('body-parser'),
cons=require('consolidate'),
dust=require('dustjs-helpers'),
md5=require('js-md5'),
pg=require('pg'), 
app=express();
var urlDataBase = 'postgres://ivlmhkficuzslb:WMu8cz613zO4s9lVcDJuHkFeoS@ec2-54-163-230-103.compute-1.amazonaws.com:5432/d361hsb4scaqro';
//var urlDataBase="postgres://postgres:1@localhost:5433/InnoHospital";
app.engine('dust',cons.dust);
app.set('view engine','dust');
app.set('views',__dirname+'/views');

var client = new pg.Client();
app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


app.get('/',function(req,res){
	console.log("-------------  -----------");
	res.render('index');
});

app.get('/patient', function(req, res){
	console.log("------------- PATIENT -----------");
	res.render('patient');
});
app.post('/newAppointment',function(req,res){// Sultan's post route handler
	console.log(req.body.date);
	console.log(req.body.time);
	console.log(req.body.doctor);


	
});
app.post('/log', function(req, res){
	console.log("-------------LOG -----------");
	
	const pg = require('pg');
	pg.defaults.ssl = true;
	const connectionString = process.env.DATABASE_URL || urlDataBase;
	const client = new pg.Client(connectionString);
	client.connect();

	var sqlQuery = 
	'SELECT * from person \
	NATURAL JOIN patient \
	where email = \'' + req.body.email + '\''; 

	var sqlQuery = 'SELECT * from person where email = \'' + req.body.email + '\''; 
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
	    console.log('------id-------' + hashsalt);
	    console.log(req.body.hashpassword);
	    console.log(md5(req.body.hashpassword + hashsalt));
	    console.log(result.rows[0].hashpassword);
	    if(md5(req.body.hashpassword + hashsalt) == result.rows[0].hashpassword) {
			res.render('patient_cabinet', {patient:result.rows});
	    }
	    else {
		//not right password or email
		res.redirect('/patient');
	    }
	}
	//client.end();
    });

    console.log('--------This----------' + result);
});

app.post('/staffMyInfo', function(req,res){
	res.render('staffMyInfo');
});

app.post('/signinStaff', function(req, res){
	res.render('StaffMain');
});

app.get('/staff', function(req, res){
	res.render('staff');
});

app.get('/appointmentBtt', function(req,res){
		
	res.render('Input_information_for_patient');
});

app.get('/backToStaffMain', function(req,res){
	res.render('StaffMain');
});

app.get('/registration', function(req, res){
	console.log("------------- REGISTRATION -----------");
	res.render('registration');
});

app.post('/addPatient',function(req,res){

	console.log("-------------ADD -----------");
	console.log(req.body.gridRadios);

	const pg = require('pg');
	pg.defaults.ssl = true;
	const connectionString = process.env.DATABASE_URL || 'postgres://ivlmhkficuzslb:WMu8cz613zO4s9lVcDJuHkFeoS@ec2-54-163-230-103.compute-1.amazonaws.com:5432/d361hsb4scaqro';
	const client = new pg.Client(connectionString);
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
});


app.listen(3000,function() {
	console.log('Server started on 3000 port');
});
