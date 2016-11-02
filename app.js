var express=require('express'),
path=require('path'),
bodyParser=require('body-parser'),
cons=require('consolidate'),
dust=require('dustjs-helpers'),
md5=require('js-md5'),
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
app.use(bodyParser.urlencoded({extended:true}));


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

	var sqlQuery = 'SELECT * from person where email = \'' + req.body.email + '\''; 
	//'\' and hashpassword = \'' + req.body.hashpassword + "\'";

	console.log(sqlQuery);

	function Autorization() { this.value = 0; }
	var isAutorize = new Autorization();
	const query = client.query(sqlQuery, function(err, result) {
		console.log(result.rows.length);
		if(result.rows.length != 0)
		{
			console.log(result.rows[0]);
			res.render('patient_cabinet', {patient:result.rows});
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
	console.log(req.body.gridRadios);

	const pg = require('pg');
	const connectionString = process.env.DATABASE_URL || 'postgres://postgres:1@localhost:5433/InnoHospital';
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

	var address=req.body.city+ ' ' + req.body.street+ ' ' + req.body.appartment;
	client.query(
		'INSERT INTO person(idPassport,firstName,secondName,address,email,telN,birthDay,gender,hashPassword,hashSalt) \
		VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
		[req.body.passport, req.body.fname, req.body.sname, address, req.body.email, req.body.phone,
		req.body.birthdate, req.body.gridRadios, md5(req.body.hashpassword + hashSolt), hashSolt]);

	res.redirect('/patient');
});


app.listen(3000,function(){
	console.log('Server started on 3000 port');
});