//var urlDataBase = 'postgres://ivlmhkficuzslb:WMu8cz613zO4s9lVcDJuHkFeoS@ec2-54-163-230-103.compute-1.amazonaws.com:5432/d361hsb4scaqro';
//var urlDataBase="postgres://postgres:1@localhost:5433/InnoHospital";

var express 	= require('express');
var cons 		= require('consolidate');
var dust 		= require('dustjs-helpers');
var config 		= require('./config');
var http 		= require('http');
var path 		= require('path');
var log 		= require('./libs/log')(module);

var app 		= express();

app.engine('dust',cons.dust);


// all environments
app.set('port', config.get('port'));
app.set('view engine','dust');
app.set('views',__dirname+'/views');
app.use(express.static(path.join(__dirname,'public')));

app.use(express.logger('dev'));
app.use(express.bodyParser());

app.use(express.cookieParser());

app.use(express.session({
	secret: 'SOME',
	cookie: { maxAge: null }
}));

app.use(app.router);

app.use(function(err, req, res, next){
	if(app.get('env') == 'development'){
		var errorHandler = express.errorHandler();	
		errorHandler(err, req, res, next);
	} else {
		res.send(500);
	}
});

app.get('/', 					require('./routes/index').index);

app.get('/patient', 			require('./routes/patient').patient);
app.get('/patient_cabinet', 	require('./routes/patient').get_patient_cabinet);
app.post('/patient_cabinet', 	require('./routes/patient').post_patient_cabinet);
app.post('/addPatient', 		require('./routes/patient').addPatient);
app.get('/registration', 		require('./routes/patient').registration);
app.post('/newAppointment', 	require('./routes/patient').newAppointment);
app.get('/PatientCard', 		require('./routes/patient').medCard);
app.get('/Scans', 				require('./routes/patient').scans);
app.get('/analysis', 			require('./routes/patient').analysis);

app.get('/gotoprofile', 		require('./routes/staff').staffInfo);
app.post('/signinStaff', 		require('./routes/staff').signinStaff);
app.get('/staff', 				require('./routes/staff').staff);
app.get('/appointmentBtt', 		require('./routes/staff').Input_information_for_patient);
app.get('/backToStaffMain', 	require('./routes/staff').staffMain);

http.createServer(app).listen(config.get('port'), function(){
  console.log('Express server listening on port ' + config.get('port'));
});
