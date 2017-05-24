var express = require('express');
var router = express.Router();

/* GET list of unique SIG and their latest locations */
router.get('/gatewayLocations', function(req, res, next) {
	var locationSet = [];
	var gatewayLocation = {};
	var reqStatus = "OK";
	console.log('GET request for gatewayLocations : ' + req);
	gatewayLocation.lat = 12.228967; 
	gatewayLocation.lng = 88.228967; 
	locationSet.push (gatewayLocation);
	res.json({status: reqStatus, results: locationSet});
	console.log('GET response for gatewayLocations : status = ' + reqStatus);
	return;
});

module.exports = router; 
