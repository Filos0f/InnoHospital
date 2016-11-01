var express=require('express'),
path=require('path'),
bodyParser=require('body-parser'),
cons=require('consolidate'),
dust=require('dustjs-helpers'),
pg=require('pg'),
app=express();
var connect="postgres://postgres:1@localhost:5433/recipebookdb";
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
	res.render('index');
});
//Server

app.get('/patient', function(req, res){
	res.render('patient');
});

app.post('/add',function(req,res){
	pg.connect(connect,function(err,client,done){
		if(err){
			return console.error('Error fetching from pool',err);
	}
	client.query("INSERT INTO recipes(name,ingredients,directions) VALUES($1,$2,$3)",
		[req.body.name,req.body.ingredients,req.body.directions]);
done();
res.redirect('/');
	});
});


app.listen(3000,function(){
	console.log('Server started on 3000 port');
});
