var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('smtps://innoprojecthospital@gmail.com:qwerty789@smtp.gmail.com');

//Не знаю как, но надо вызывать эту функцию от куда-то и передавать ей с запросом сообщение
//и мыло кому
exports.SendNotification = function (email, message) {

    //var email = req.body.email;
    var text = message;
// setup e-mail data with unicode symbols
    var mailOptions = {
        from: 'innoprojecthospital@gmail.com <innoprojecthospital@gmail.com>', // sender address
        to: email, // list of receivers
        subject: 'InnoHospital notification', // Subject line
        text: text, // plaintext body
        //html: '<b>Hello world ?</b>' // html body
    };

// send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
}
