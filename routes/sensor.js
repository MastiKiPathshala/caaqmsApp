/*************************************************************************
 *
 * $file: sensor.js
 *
 * @brief: web App back-end code, reading data from blobs and sending
 * it to browser.
 *
 * @author: Saurabh Singh
 *
 * @date: 15 May 2017 First version of web app back-end code
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
var express = require('express');
var router = express.Router();

var azure = require('azure-storage');

var blobService = azure.createBlobService("tanstor","KS4Q+Fe5C+bzLxuCymZV61dMkvbiDQuwqmkiaUAA23agTyI69ijoBsfATM96cMiwytAXlAHcmFuCJUqKgafe+Q==");
var fs = require('fs');
var moment = require('moment-timezone');
var date = require('date-and-time');
var containerName = 'rpi-blob-container';

/* GET list of unique SIG and their latest locations */
router.get('/gatewayLocations', function(req, res, next) {
	
	var dataType = "gps";
	log.debug("data type: "+dataType);
	var gatewayUniqueId = req.params.gatewayId;
	log.debug("gatewayUniqueId : "+gatewayUniqueId);
	
	var locationSet = [];
	var gatewayLocation = {};
	
	gatewayLocation.lat = [];
	gatewayLocation.lng = [];
	gatewayLocation.airQuality = [];
	gatewayLocation.gatId = [];
	
	var reqStatus = "OK";
	log.debug('GET request for gatewayLocations : ' + req);
	
	GetFinalDataFromFile(dataType,res,function(fileData){
		
		var data = fileData;
		var splitData = data.toString().split("\n");
		var length = splitData.length;
				
		for(var i =0;i<length; i++){
					
			var lastData = splitData[i];
			var parseData = JSON.parse(lastData);
				
			log.debug("GatewayId: "+parseData.gatewayid +" latitude: "+parseData.latitude + " longitude: "+parseData.longitude+ " qualityScore: "+parseData.qualityscore);
				
			var latitude = parseFloat(parseData.latitude);
			var longitude = parseFloat(parseData.longitude);
			var qualityscore = parseFloat(parseData.qualityscore);
			var gatewayId = parseData.gatewayid;
						
			gatewayLocation.lat[i] = latitude; 
			gatewayLocation.lng[i] = longitude; 
			gatewayLocation.gatId[i] = gatewayId; 
			gatewayLocation.airQuality[i] = qualityscore
				
		}
		log.debug("LOCATION: "+JSON.stringify(gatewayLocation));
		res.json({status: reqStatus, results: gatewayLocation});
				
		log.debug('GET response for gatewayLocations : status = ' + reqStatus);
		return;
							
	})
});
//var flag = true;
/* GET temperature data*/
router.get('/temperature/:gatewayId', function(req, res, next) {
	
	//var dataType = req.params.temperature;
	var dataType = "temperature";
	log.debug("data type: "+dataType);
	var gatewayUniqueId = req.params.gatewayId;
	log.debug("gatewayUniqueId : "+gatewayUniqueId);
	
	var tempSensor = {};
	tempSensor.temp = [];
	tempSensor.airQuality = [];
	
	var countGatewayId = 0;
	var countMatchedGatewayId = 0;
	var reqStatus = "OK";
	log.debug('GET request for Temperature : ' + req);
	
	GetFinalDataFromFile(dataType,res,function(fileData){
		
		var data = fileData;
		var splitData = data.toString().split("\n");
		var numberOfRowsInFile = splitData.length;
				
		for(var i =0;i<numberOfRowsInFile; i++){
					
			var lastData = splitData[i];
			var parseData = JSON.parse(lastData);
				
			log.debug("GatewayId: "+parseData.gatewayid + " Temperature: "+parseData.temperature+ " qualityScore: "+parseData.qualityscore);
			var gatewayId = parseData.gatewayid;
						
			if ( gatewayId == gatewayUniqueId ) {
				
				var temperature = parseFloat(parseData.temperature);
						
				var qualityscore = parseFloat(parseData.qualityscore);
						
				tempSensor.temp[countMatchedGatewayId] = temperature; 
 
				tempSensor.airQuality[countMatchedGatewayId] = qualityscore;
				countMatchedGatewayId++
							
			}else {
										
				countGatewayId ++;
			}
		}
		if( countGatewayId == numberOfRowsInFile ){
			log.debug("required gateway not found in blob data");
			res.json({status: "error", results: "required gateway not found in blob data "});
		}else{
			log.debug("TEMPERATURE: "+JSON.stringify(tempSensor));
			res.json({status: reqStatus, results: tempSensor});
				
			log.debug('GET response for gatewayLocations : status = ' + reqStatus);
			return;
		}
	})
	
});


/* GET humidity data */
router.get('/humidity/:gatewayId', function(req, res, next) {
	
	//var dataType = req.params.humidity;
	var dataType = "humidity";
	log.debug("data type: "+dataType);
	var gatewayUniqueId = req.params.gatewayId;
	log.debug("gatewayUniqueId : "+gatewayUniqueId);
	
	var humidSensor = {};
	
	humidSensor.humid = [];
	humidSensor.airQuality = [];
	
	var countGatewayId = 0;
	var countMatchedGatewayId = 0;
	var reqStatus = "OK";
	log.debug('GET request for humidity : ' + req);
	
	GetFinalDataFromFile(dataType,res,function(fileData){
		
		var data = fileData;
		var splitData = data.toString().split("\n");
		var numberOfRowsInFile = splitData.length;
				
		for(var i =0;i<numberOfRowsInFile; i++){
					
			var lastData = splitData[i];
			var parseData = JSON.parse(lastData);
					
			log.debug("GatewayId: "+parseData.gatewayid + " Humidity: "+parseData.humidity+ " qualityScore: "+parseData.qualityscore);
						
			var gatewayId = parseData.gatewayid;
						
			if ( gatewayId == gatewayUniqueId ) {
						
				var humidity = parseFloat(parseData.humidity);
				
				var qualityscore = parseFloat(parseData.qualityscore);
						
				humidSensor.humid[countMatchedGatewayId] = humidity; 
				humidSensor.airQuality[countMatchedGatewayId] = qualityscore;
				countMatchedGatewayId++;
				
			}else {
										
				countGatewayId ++;
			}
				
		}
		if( countGatewayId == numberOfRowsInFile ){
									
			log.debug("required gateway not found in blob data");
			res.json({status: "error", results: "required gateway not found in blob data "});
		}else{
			log.debug("HUMIDITY: "+JSON.stringify(humidSensor));
			res.json({status: reqStatus, results: humidSensor});
				
			log.debug('GET response for gatewayLocations : status = ' + reqStatus);
			return;
		}
			
	})
});

/* GET so2 data*/
router.get('/so2/:gatewayId', function(req, res, next) {
	
	//var dataType = req.params.so2;
	var dataType = "so2";
	log.debug("data type: "+dataType);
	var gatewayUniqueId = req.params.gatewayId;
	log.debug("gatewayUniqueId : "+gatewayUniqueId);
	
	var so2Sensor = {};
	
	so2Sensor.so2 = [];
	so2Sensor.airQuality = [];
	
	var countGatewayId = 0;
	var countMatchedGatewayId = 0;
	var reqStatus = "OK";
	log.debug('GET request for so2 : ' + req);
				
	GetFinalDataFromFile(dataType,res,function(fileData){
				
		var data = fileData;
		var splitData = data.toString().split("\n");
		var numberOfRowsInFile = splitData.length;
				
		for(var i =0;i<numberOfRowsInFile; i++){
					
			var lastData = splitData[i];
			var parseData = JSON.parse(lastData);
				
			log.debug("GatewayId: "+parseData.gatewayid + " So2: "+parseData.so2+ " qualityScore: "+parseData.qualityscore);
						
			var gatewayId = parseData.gatewayid;
						
			if ( gatewayId == gatewayUniqueId ) {
				
				var so2Data = parseFloat(parseData.so2);
				var qualityscore = parseFloat(parseData.qualityscore);
						
				so2Sensor.so2[countMatchedGatewayId] = so2Data; 
				so2Sensor.airQuality[countMatchedGatewayId] = qualityscore;
				countMatchedGatewayId ++;
				
			}else {
										
				countGatewayId ++;
			}
				
		}if( countGatewayId == numberOfRowsInFile ){
									
			log.debug("required gateway not found in blob data");
			res.json({status: "error", results: "required gateway not found in blob data "});
		}else{
			log.debug("SO2: "+JSON.stringify(so2Sensor));
			res.json({status: reqStatus, results: so2Sensor});
				
			log.debug('GET response for gatewayLocations : status = ' + reqStatus);
			return;
		}
	})
});

/* GET no2 data */
router.get('/no2/:gatewayId', function(req, res, next) {
	
	//var dataType = req.params.no2;
	var dataType = "no2";
	log.debug("data type: "+dataType);
	var gatewayUniqueId = req.params.gatewayId;
	log.debug("gatewayUniqueId : "+gatewayUniqueId);
	
	var no2Sensor = {};
	
	no2Sensor.no2 = [];
	no2Sensor.airQuality = [];
	
	var countGatewayId = 0;
	var countMatchedGatewayId = 0;
	
	var reqStatus = "OK";
	log.debug('GET request for no2: ' + req);
	
	GetFinalDataFromFile(dataType,res,function(fileData){
	
		var data = fileData;
		var splitData = data.toString().split("\n");
		var numberOfRowsInFile = splitData.length;
				
		for(var i =0;i<numberOfRowsInFile; i++){
					
			var lastData = splitData[i];
			var parseData = JSON.parse(lastData);
				
			log.debug("GatewayId: "+parseData.gatewayid + " No2: "+parseData.no2+ " qualityScore: "+parseData.qualityscore);
			var gatewayId = parseData.gatewayid;
						
			if ( gatewayId == gatewayUniqueId ) {
				
				var no2Data = parseFloat(parseData.no2);
				var qualityscore = parseFloat(parseData.qualityscore);
						
				no2Sensor.no2[countMatchedGatewayId] = no2Data; 
				no2Sensor.airQuality[countMatchedGatewayId] = qualityscore;
				countMatchedGatewayId ++;
			}else {
										
				countGatewayId ++;
			}
				
		}
		if( countGatewayId == numberOfRowsInFile ){
									
			log.debug("required gateway not found in blob data");
			res.json({status: "error", results: "required gateway not found in blob data "});
			
		}else{
			
			log.debug("NO2: "+JSON.stringify(no2Sensor));
			res.json({status: reqStatus, results: no2Sensor});
				
			log.debug('GET response for gatewayLocations : status = ' + reqStatus);
			return;
		}
	})
			
});

//common functions for all sensor data type...

var GetFinalDataFromFile = function (dataType,res,callback) {
	var blobNameMismatchCounter = 0;
	GetRequiredBlobNames(dataType,function(reqBlobName){
		
		log.debug("required BlobName: "+reqBlobName);
	
		GetBlobNames(function(wholeDataForblobName){
		    
			var blobNameData = wholeDataForblobName;
			
			if( blobNameData == "error" ){
				
				res.json({status: "error", results: "Couldn't list blobs for container : read ECONNRESET"});
				
			}else {
				
				for(var i = 0;i< blobNameData.length;i++){
			
					var blobName = blobNameData[i].name;
					var fileName = dataType+".txt"
					//log.debug(blobName);
					if(blobName.indexOf(reqBlobName) > -1){
					
						log.debug("blob Name: "+blobName);
				
						FetchBlobData(blobName,fileName,function(fileData){
						
							log.debug("output of file : "+fileName);
						
							if(fileData == "error"){
							
								log.debug("error in reding file");
								res.json({status: "error", results: "error in reding file: "+fileName});
							}else{
						
								callback(fileData);
							}
						});
					}else{
						
						blobNameMismatchCounter ++;
						
						log.trace("error in matching blob name: "+" blobNameMismatchCounter: "+blobNameMismatchCounter+" wholeDataForblobName.length: "+wholeDataForblobName.length);
						var noOfBlobs = wholeDataForblobName.length
						
						if( blobNameMismatchCounter == noOfBlobs) {
						
							log.debug("error in matching blob name");
							res.json({status: "error", results: "blob not found in the container: "+containerName});
							
						}
					}
				}
			}
		});	
	})
}

var GetRequiredBlobNames = function (dataType,callback) {
	
	var date = require('date-and-time');
	var now = new Date();

	var currentTime = date.format(now, 'YYYY/MM/DD HH:mm A [GMT]Z', true);
	var splitCurrentTime = currentTime.split("/");

	var year = splitCurrentTime[0];
	var month = splitCurrentTime[1];

	var getDateHour = splitCurrentTime[2].split(" ");
	var date = getDateHour[0];

	var getHour = getDateHour[1].split(":");
	var hour = getHour[0];

	var requiredBlobName = dataType+"-metadata-batch"+"/"+year+"/"+month+"/"+date+"/"+hour;
	//var requiredBlobName = dataType+"/"+year+"/"+month+"/"+"25"+"12";
	
	callback(requiredBlobName);

}

var GetBlobNames = function (callback) {
	
	blobService.listBlobsSegmented(containerName, null, function(err, result) {
		
		if (err) {
		
			log.debug("Couldn't list blobs for container: ", containerName);
			log.error(err);
			callback("error");

		} else {
			log.debug('Successfully listed blobs for container: '+ containerName);
			var data = result.entries;
			callback(data);
		}
	});	
}
var FetchBlobData = function (blobName,fileName,callback) {
	
	blobService.getBlobToStream(containerName, blobName, fs.createWriteStream('/tmp/'+fileName), function(error, result, response) {
		
		if (!error) {
		
			var data = fs.readFile('/tmp/'+fileName,function(err,data){
			//var data = fs.readFile('temperature1.txt',function(err,data){

				var fss = require('extfs');
 
				var empty = fss.isEmptySync('/tmp/'+fileName);
				//var empty = fss.isEmptySync('temperature1.txt');
					console.log(empty);
									
				if(err){
					
					log.debug("error while reading file: "+err);
					callback("error");
					
				}else {
					
					if(empty === true){
						
						log.debug("Error: file empty");
						callback("error");
						
					}else {
						
						callback(data);
					}	
				}
			})
			
		}else{
			
			log.debug(error);
		}
	})
}

module.exports = router; 
