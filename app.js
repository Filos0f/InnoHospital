var express=require('express'),
path=require('path'),
bodyParser=require('body-parser'),
cons=require('consolidate'),
dust=require('dustjs-helpers'),
pg=require('pg'),
md5=require('js-md5'),
app=express();
var connect="postgres://lida:is241s05@localhost:5432/InnoHospital";
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
	const connectionString = process.env.DATABASE_URL || 'postgres://lida:is241s05@localhost:5432/LidaDataBase';
	const client = new pg.Client(connectionString);
	client.connect();

	var sqlQuery = 'SELECT * from person where email = \'' + req.body.email + '\'';

	console.log(sqlQuery);

	function Autorization() { this.value = 0; }
	var isAutorize = new Autorization();
	const query = client.query(sqlQuery, function(err, result) {
		console.log(result.rows.length);
		if(result.rows.length != 0)
		{
			//var obj = JSON.parse(result.rows);
			console.log(JSON.stringify(result.rows[0]).substring(JSON.stringify(result.rows[0]).indexOf('hashsalt:')+11, JSON.stringify(result.rows[0]).indexOf('hashsalt')));
		
			console.log(obj);
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
	console.log(req.body.gender);

	const pg = require('pg');
	const connectionString = process.env.DATABASE_URL || 'postgres://lida:is241s05@localhost:5432/LidaDataBase';
	const client = new pg.Client(connectionString);
	client.connect();

//	var hashSolt = 2132343;

	function hash(key)
	{
	    var h = 0;
	    
	    for (p = 0; p != key.length; p++) {
    		h = h * 31 + key.charAt(p);
	    }
	    return h;
	}

	var hashSolt = hash(req.body.passport);
	console.log(req.body.appartment);
	console.log(req.body.email);

	var sqlQuery = 'INSERT INTO person VALUES (\'' + req.body.passport + '\', \'' + 
	req.body.fname + '\', \'' + req.body.sname + '\', \'' +
	req.body.city + ' ' + req.body.street + ' ' + req.body.appartment +
	'\', \'' + req.body.email + '\', \'' + req.body.phone + '\', \'' + req.body.birthdate +
	'\', ' + false + ',\'' + md5(req.body.hashpassword + hashSolt) + '\',\'' + hashSolt + '\')';
	

	console.log(sqlQuery);
	client.query(sqlQuery);
	
	res.render('patient');
	/*
	
	pg.connect(connect,function(err,client,done){
		if(err){
			return console.error('Error fetching from pool',err);
	}
	client.query("INSERT INTO recipes(name,ingredients,directions) VALUES($1,$2,$3)",
		[req.body.name,req.body.ingredients,req.body.directions]);
	done(
	res.redirect('/log');
	});
	*/
	
});

app.get('/room', function(reg, res) {
	console.log('----------------to Room --------------------');
	res.render('/pathient_cabinet');
});

app.listen(3000,function(){
	console.log('Server started on 3000 port');
});
