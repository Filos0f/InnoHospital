
/*
 * GET home page.
 */

exports.index = function(req, res){
	console.log("-------------  -----------");
	req.session.numberOfVisits = req.session.numberOfVisits + 1 || 1;
	console.log("VIsits: " + req.session.numberOfVisits);
	res.render('index');
};
