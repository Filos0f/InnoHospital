var fs 		= require('node-fs');
//COPYPAST///////////////////////////////
var config 		= require('../config');
var pg 			= require('pg');
var md5 		= require('js-md5');
var dataBase 	= require('../libs/dbManagement');
var async       = require('async');
////////////////////////////////////////

function LoadStaffInformation(res, email, staffHandler) {
    var results = [];
    var appointmentInfo = [];

    async.series([
            function(callback) {
                const client = dataBase.ConnectToDataBase();
                client.connect();
                console.log("FIRST CALLBACK!");

            var sqlQuery =
                'SELECT * from person \
                NATURAL JOIN employee \
                natural join positions \
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
                //console.log('Here should be results[0] - \n' + results[0].idemp);

                var sqlQuery =
                    'select v.day, v.starttime, per.firstname, \
                    per.secondname\
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
                staffHandler(results, appointmentInfo);
                //res.render('patient_cabinet', {patient:results[0],positions:results})
            },
        ],
        function(err) {
            if (err) return callback(err);
            console.log('Both finished!');
        });
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
    res.render('Input_information_for_patient');
};

exports.StaffMain = function(req,res) {
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

    //var sqlQuery =
    //	'SELECT * from Person where email = \'' + req.body.email + '\'';

    var sqlQuery =
        'SELECT * from person';


    const query = staff.query(sqlQuery);
    console.log(sqlQuery);

    const result = [];
    query.on('fields', function(fields) {
        console.log(result);

        result.push(fields);
    });
    console.log(sqlQuery);

    query.on("end", function(result){
        console.log(result);
        if(result.fields[0] === undefined){
            res.render('StaffMain');
        }
        else{
            var hashsalt = result.fields[0].hashsalt;
            if(md5(req.body.hashpassword + hashsalt) == result.fields[0].hashpassword) {
                res.render('StaffMyInfo');
            }
            else {
                console.log("error2");
                res.render('StaffMain');
            }
        }
    });
    console.log(sqlQuery);
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
}