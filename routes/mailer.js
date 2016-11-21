/**
 * Created by Master on 21-Nov-16.
 */
var smtpTransport = require('nodemailer-smtp-transport');
var transport = nodemailer.createTransport(
    smtpTransport({
        service: 'rambler',
        auth: {
            user: 'innohospital@rambler.ru',
            pass: 'passfrominnohosp'
        }
    })
);

