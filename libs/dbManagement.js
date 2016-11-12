var config 		= require('../config');
var pg 			= require('pg');

exports.ConnectToDataBase = function ConnectToDataBase()
{
	const pg = require('pg');
	pg.defaults.ssl = true;
	const connectionString = process.env.DATABASE_URL || config.get('dbPort');
	return new pg.Client(connectionString);
}