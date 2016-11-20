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
        });
        res.render('staffMyInfo', {employee:results[0],positions:results})
        //});
        console.log("3 - Email session - " + sess.email);
    }
    console.log("-------------staffMyInfo end-----------");
    //res.render('staffMyInfo');
};

exports.staff = function(req, res) {

    console.log("------------- Staff init -----------");
    // var analizesTitle = JSON.parse(fs.readFileSync("title_of_analizis", "utf8"));
    // console.log("------------- Staff init 1-----------");
    //
    // var diagnosesType = JSON.parse(fs.readFileSync("type_of_diagnoses", "utf8"));
    // console.log("------------- Staff init 2-----------");
    //
    // var analizesType = JSON.parse(fs.readFileSync("type_of_typeAnaliz", "utf8"));
    // console.log("------------- Staff init 3-----------");
    // var EmployeePositionsId = JSON.parse(fs.readFileSync("types_of_id_employee", "utf8"));
    //
    // console.log("------------- Staff init 4-----------");
    // var allStaff = JSON.parse(fs.readFileSync("Staff.txt", "utf8"));
    //
    // console.log("------------- Staff hash -----------");
    // function hash(key)
    // {
    //     var h = 0;
    //
    //     for (p = 0; p != key.length; p++) {
    //         h = h * 31 + key.charAt(p);
    //     }
    //     return h;
    // }
    // console.log("------------- Staff position -----------");
    /*
     const staff = dataBase.ConnectToDataBase();
     staff.connect();
     var sqlQuery = 'SELECT * from positions';
     const query = staff.query(sqlQuery);
     console.log(query);
     console.log(query.rows);
     const result = [];
     query.on('rows', function(row) {
     console.log(row);
     result.push(row);
     });
     */
    // async.series([
    //     function(callback) {
    //         const db = dataBase.ConnectToDataBase();
    //         db.connect();
    //
    //         var query = db.query( 'Select * from employee');
    //         const result = [];
    //         query.on('rows', function(row) {
    //             result.push(row);
    //         });
    //
    //         query.on("end", function(result) {
    //             if (result.rows[0] === undefined) {
    //                 for(var y = 0; y < allStaff.length; y++)
    //                 {
    //                     db.query(
    //                         'INSERT INTO person(idPassport,firstName,secondName,address,email,telN,birthDay,gender,hashPassword,hashSalt) \
    //                        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
    //                         [allStaff[y]['People']['idPassport'], allStaff[y]['People']['firstName'], allStaff[y]['People']['secondName'], allStaff[y]['People']['address'], allStaff[y]['People']['email'], allStaff[y]['People']['telN'],
    //                             allStaff[y]['People']['birthday'], allStaff[y]['People']['gender'],
    //                             md5(allStaff[y]['People']['password'] + hash(allStaff[y]['People']['idPassport'])),
    //                             hash(allStaff[y]['People']['idPassport'])]);
    //
    //                     db.query(
    //                         'INSERT INTO Employee(rating,idPos,idEmp,roomN,idPassport) \
    //                        VALUES($1,$2,$3,$4,$5)',
    //                         ['0', allStaff[y]['People']['Employee']['idPos'], allStaff[y]['People']['Employee']['idEmp'],
    //                             allStaff[y]['People']['Employee']['roomN'], allStaff[y]['People']['idPassport']]
    //                     );
    //
    //                     db.query(
    //                         'INSERT INTO WorkingSchedule(roomN,startTime, finishTime, day) \
    //                        VALUES($1,$2,$3,$4)',
    //                         [allStaff[y]['People']['Employee']['WorkingSchedule']['roomN'], allStaff[y]['People']['Employee']['WorkingSchedule']['startTime'],
    //                             allStaff[y]['People']['Employee']['WorkingSchedule']['finishTime'], allStaff[y]['People']['Employee']['WorkingSchedule']['date']]
    //                     );
    //
    //                 }
    //                 for (var i = 0; i < EmployeePositionsId.length; ++i) {
    //                     console.log(i);
    //                     db.query(
    //                         'INSERT INTO positions(idPos, title, idEmp) \
    //                         VALUES($1,$2,$3)',
    //                         [EmployeePositionsId[i]['id'], EmployeePositionsId[i]['value'], null]
    //                     );
    //                 }
    //                 for(var k = 0; k < analizesType.length; ++k)
    //                 {
    //                     console.log(k);
    //                     db.query(
    //                         'INSERT INTO conclusiontypes(idtype, title) \
    //                             VALUES($1,$2)',
    //                         [analizesType[k]['id'], analizesType[k]['value']]
    //                     );
    //                 }
    //                 for(var m = 0; m < analizesTitle.length; ++m) {
    //                     for (var j = 0; j < analizesTitle[m]['value'].length; ++j) {
    //                         console.log(analizesTitle[m]['value'][j]['id'] + " " + analizesTitle[m]['value'][j]['title'] + " " + analizesTitle[m]['idType']);
    //                         db.query(
    //                             'INSERT INTO generalizedAnalysisTitles(idtitle, title, idType) \
    //              VALUES($1,$2, $3)',
    //                             [analizesTitle[m]['value'][j]['id'], analizesTitle[m]['value'][j]['title'], analizesTitle[m]['idType']]);
    //                     }
    //                 }
    //                 for(var t = 0; t < diagnosesType.length; t++)
    //                 {
    //                     var id = (t + 1) * 999;
    //                     db.query(
    //                         'INSERT INTO DiagnosisInfo(title, idtitle, nationalcode, rate) \
    //                        VALUES($1,$2, $3, $4)',
    //                         [diagnosesType[t]['value'], id, diagnosesType[t]['id'], '0']);
    //                 }
    //             }
    //         });
    //     }
    // ], function (err) {
    //     if(err) callback(err);
    // });
    /*
     query.on("end", function(result) {
     console.log("------------------------------" + result1111111111111.rows[0] + "--------------------------");
     if (result.rows[0] === undefined) {
     for (var i = 0; i < EmployeePositionsId.length; ++i) {
     console.log(i);
     staff.query(
     'INSERT INTO positions(idPos, title, idEmp) \
     VALUES($1,$2,$3)',
     [EmployeePositionsId[i]['id'], EmployeePositionsId[i]['value'], null]
     );
     }
     }
     });
     var staff2 = dataBase.ConnectToDataBase();
     staff2.connect();
     var sqlQuery2 = 'SELECT * from conclusiontypes';
     const query2 = staff2.query(sqlQuery2);
     console.log(query2);
     console.log(query2.rows);
     const result2 = [];
     query2.on('rows', function(row) {
     console.log(row);
     result2.push(row);
     });
     query2.on("end", function(result2) {
     console.log("------------------------------" + result2.rows[0] + "--------------------------");
     if (result2.rows[0] === undefined) {
     for(var k = 0; k < analizesType.length; ++k)
     {
     console.log(k);
     staff2.query(
     'INSERT INTO conclusiontypes(idtype, title) \
     VALUES($1,$2)',
     [analizesType[k]['id'], analizesType[k]['value']]
     );
     }
     }
     });
     */
    // const staff3 = dataBase.ConnectToDataBase();
    // staff3.connect();
    //
    //
    // var sqlQuery3 = 'SELECT * from generalizedAnalysisTitles';
    // const query3 = staff3.query(sqlQuery3);
    // console.log(query3);
    //
    //
    //
    // console.log(query3.rows);
    // const result3 = [];
    // query3.on('rows', function(row) {
    // 	console.log(row);
    // 	result3.push(row);
    // });
    //
    //
    //
    // query3.on("end", function(result3) {
    // 	console.log("------------------------------" + result3.rows[0] + "--------------------------");
    // 	if (result3.rows[0] === undefined) {
    // 		for(var m = 0; m < analizesTitle.length; ++m) {
    // 			for (var j = 0; j < analizesTitle[m]['value'].length; ++j) {
    // 				console.log(analizesTitle[m]['value'][j]['id'] + " " + analizesTitle[m]['value'][j]['title'] + " " + analizesTitle[m]['idType']);
    // 				staff3.query(
    // 					'INSERT INTO generalizedAnalysisTitles(idtitle, title, idType) \
    //                   VALUES($1,$2, $3)',
    // 					[analizesTitle[m]['value'][j]['id'], analizesTitle[m]['value'][j]['title'], analizesTitle[m]['idType']]);
    // 			}
    // 		}
    // 	}
    // });
    //
    //
    // const staff5 = dataBase.ConnectToDataBase();
    // staff5.connect();
    //
    //
    // var sqlQuery5 = 'SELECT * from generalizedAnalysisTitles';
    // const query5 = staff5.query(sqlQuery5);
    // console.log(query5);
    //
    //
    //
    // console.log(query5.rows);
    // const result5 = [];
    // query5.on('rows', function(row) {
    // 	console.log(row);
    // 	result5.push(row);
    // });
    //
    //
    //
    // query5.on("end", function(result5) {
    // 	console.log("------------------------------" + result5.rows[0] + "--------------------------");
    // 	if (result5.rows[0] === undefined) {
    // 		for(var t = 0; t < diagnosesType.length; t++)
    // 		{
    // 			var id = (t + 1) * 999;
    // 				staff5.query(
    // 					'INSERT INTO DiagnosisInfo(title, idtitle, nationalcode, rate) \
    // 			       VALUES($1,$2, $3, $4)',
    // 					[diagnosesType[t]['value'], id, diagnosesType[t]['id'], '0']);
    // 		}
    //
    // 	}
    // });
    //
    //
    //
    // const staff6 = dataBase.ConnectToDataBase();
    // staff6.connect();
    //
    //
    // var sqlQuery6 = 'SELECT * from generalizedAnalysisTitles';
    // const query6 = staff6.query(sqlQuery6);
    // console.log(query6);
    //
    //
    //
    // console.log(query6.rows);
    // const result6 = [];
    // query6.on('rows', function(row) {
    // 	console.log(row);
    // 	result6.push(row);
    // });
    //
    //
    //
    // query6.on("end", function(result6) {
    // 	console.log("------------------------------" + result6.rows[0] + "--------------------------");
    // 	if (result6.rows[0] === undefined) {
    // 		for(var y = 0; y < allStaff.length; y++)
    // 		{
    //
    // 				staff6.query(
    // 						'INSERT INTO person(idPassport,firstName,secondName,address,email,telN,birthDay,gender,hashPassword,hashSalt) \
    // 			           VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
    // 						[allStaff[y]['People']['idPassport'], allStaff[y]['People']['firstName'], allStaff[y]['People']['secondName'], allStaff[y]['People']['address'], allStaff[y]['People']['email'], allStaff[y]['People']['telN'],
    // 							allStaff[y]['People']['birthday'], allStaff[y]['People']['gender'],
    // 							md5(allStaff[y]['People']['password'] + hash(allStaff[y]['People']['idPassport'])),
    // 							hash(allStaff[y]['People']['idPassport'])]);
    //
    // 				staff6.query(
    // 					'INSERT INTO Employee(rating,idPos,idEmp,roomN,idPasport) \
    // 			       VALUES($1,$2,$3,$4,$5)',
    // 					['0', allStaff[y]['People']['Employee']['idPos'], allStaff[y]['People']['Employee']['idEmp'],
    // 						allStaff[y]['People']['Employee']['roomN'], allStaff[y]['People']['idPassport']]
    // 				);
    //
    // 				staff6.query(
    // 					'INSERT INTO WorkingSchedule(roomN,startTime, finishTime, day) \
    // 			       VALUES($1,$2,$3,$4)',
    // 					[allStaff[y]['People']['Employee']['WorkingSchedule']['roomN'], allStaff[y]['People']['Employee']['WorkingSchedule']['startTime'],
    // 						allStaff[y]['People']['Employee']['WorkingSchedule']['finishTime'], allStaff[y]['People']['Employee']['WorkingSchedule']['date']]
    // 				);
    //
    // 		}
    // 	}
    // });
    // console.log("------------- Staff end -----------");
    //
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