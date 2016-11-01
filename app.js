var express=require('express'),
path=require('path'),
bodyParser=require('body-parser'),
cons=require('consolidate'),
dust=require('dustjs-helpers'),
pg=require('pg'),
app=express();
var connect="postgres://postgres:1@localhost:5433/InnoHospital";
//Assign DUST engine to .dust files
app.engine('dust',cons.dust);
//Set deafalt ext
app.set('view engine','dust');
app.set('views',__dirname+'/views');

var client = new pg.Client();
app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));


app.get('/',function(req,res){
	console.log("-------------  -----------");
	res.render('index');
});
//Server

app.get('/patient', function(req, res){
	console.log("------------- PATIENT -----------");
	res.render('patient');
});

// one@inno.com
app.post('/log', function(req, res){
	console.log("-------------LOG -----------");
	 
	
	const pg = require('pg');
	const connectionString = process.env.DATABASE_URL || 'postgres://postgres:1@localhost:5433/InnoHospital';
	const client = new pg.Client(connectionString);
	client.connect();

	var sqlQuery = 'SELECT * from person where email = \'' + req.body.email + 
	'\' and hashpassword = \'' + req.body.hashpassword + "\'";

	console.log(sqlQuery);

	function Autorization() { this.value = 0; }
	var isAutorize = new Autorization();
	const query = client.query(sqlQuery, function(err, result) {
		console.log(result.rows.length);
		if(result.rows.length == 0)
		{
			res.render('patient_cabinet');
		}
		else
		{
			res.redirect('/patient');
		}
	});
});

app.get('/registration', function(req, res){
	console.log("------------- REGISTRATION -----------");
	res.render('registration');
});

app.post('/addPatient',function(req,res){
 
	console.log("-------------ADD -----------");
	console.log(req.session.gridRadios);

	const pg = require('pg');
	const connectionString = process.env.DATABASE_URL || 'postgres://postgres:1@localhost:5433/InnoHospital';
	const client = new pg.Client(connectionString);
	client.connect();

	var hashSolt = 2132343;
	var hashpassword = 2132343 * 2132343;

	var sqlQuery = 'INSERT INTO person VALUES(' + req.body.passport + ', ' + 
	req.body.fname + ', ' + req.body.sname + ', ' +
	req.body.city + ' ' + req.body.street + ' ' + req.body.appartment +
	+ ', ' + eq.body.email + ', ' + eq.body.phone + ', ' + eq.body.birthdate +
	', ' + eq.body.gender + ', ' + hashpassword + ', ' + hashSolt;

	console.log(sqlQuery);

	client.query(sqlQuery);

	/*
	
	pg.connect(connect,function(err,client,done){
		if(err){
			return console.error('Error fetching from pool',err);
	}
	client.query("INSERT INTO recipes(name,ingredients,directions) VALUES($1,$2,$3)",
		[req.body.name,req.body.ingredients,req.body.directions]);
	done();
	res.redirect('/log');
	});
	*/
});


app.listen(3000,function(){
	console.log('Server started on 3000 port');
});
