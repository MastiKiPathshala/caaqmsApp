var express = require('express');
var fs = require('fs');
var moment = require('moment-timezone');
var azure = require('azure-storage');

var router = express.Router();

var blobService = azure.createBlobService("tanstor","KS4Q+Fe5C+bzLxuCymZV61dMkvbiDQuwqmkiaUAA23agTyI69ijoBsfATM96cMiwytAXlAHcmFuCJUqKgafe+Q==");


/* GET list of unique SIG and their latest locations */
router.get('/gatewayLocations', function(req, res, next) {

	var now = moment();
	var currentTime = now.tz("America/New_York").format('YYYY-MM-DDTHH:mm:ss.SSSZZ');

	var splitTime = currentTime.split("-");
	var splitDay = splitTime[2].split("T");

	var splitHour = splitDay[1].split(":");
	//var path = "sendall"+"/"+splitTime[0]+"/"+splitTime[1]+"/"+splitDay[0]+"/"+splitHour[0];
	var path = "logs"+"/"+splitTime[0]+"/"+splitTime[1]+"/"+splitDay[0]+"05";

	var locationSet = [];
	var gatewayLocation = {};
	gatewayLocation.lat = [];
	gatewayLocation.lng = [];
	gatewayLocation.airQuality = [];

	var reqStatus = "OK";
	log.debug('GET request for gatewayLocations : ' + req);

	var containerName = 'rpi-blob-container';
	blobService.listBlobsSegmented (containerName, null, function(err, result) {

		if (err) {

			log.debug("Couldn't list blobs for container %s", containerName);
			console.error(err);

		} else {

			log.debug('Successfully listed blobs for container %s', containerName);
			var data = result.entries;

			for(var i = 0; i < data.length; i++){

				var name = data[i].name;

				if(name.indexOf(path) > -1){
					log.debug(name);

					FetchBlobData(name);
				}
			}
		}
	});

	var count = 5;

	var FetchBlobData = function (name) {

		count++;
		log.debug('output'+count+'.txt');

		blobService.getBlobToStream('rpi-blob-container', name, fs.createWriteStream('output'+count+'.txt'), function(error, result, response) {

			if (!error) {

				log.debug("File name: "+'output'+count+'.txt');

				var data = fs.readFile('output'+count+'.txt',function(err,data){

					if(err){

						log.error(err);
					}else {

						var splitData = data.toString().split("\n");
						var length = splitData.length;

						for(var i =0;i<length; i++){

							var lastData = splitData[i];
							var parseData = JSON.parse(lastData);

							log.debug("latitude: "+parseData.latitude + " longitude: "+parseData.longitude+ " qualityScore: "+parseData.qualityscore);

							var latitude = parseFloat(parseData.latitude);
							var longitude = parseFloat(parseData.longitude);
							var qualityScore = parseFloat(parseData.qualityscore);

							gatewayLocation.lat[i] = latitude;
							gatewayLocation.lng[i] = longitude;
							gatewayLocation.airQuality[i] = qualityScore;

						}
						log.debug(gatewayLocation);
						res.json({status: reqStatus, results: gatewayLocation});

						log.debug('GET response for gatewayLocations : status = ' + reqStatus);
						return;
					}
				});
			}else{

				log.error(error);
			}
		})
	}
});

module.exports = router; 
