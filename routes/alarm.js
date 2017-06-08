/*************************************************************************
 *
 * $file: alarm.js
 *
 * @brief: web App back-end code, get and set alarm rules, get alerts .
 *
 * @author: Saurabh Singh
 *
 * @date: 08 june 2017 First version of web app back-end code
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 *
 ************************************************************************/
var express = require('express');
var router = express.Router();
var uuid = require('uuid');
var azure = require('azure-storage');

var blobService = azure.createBlobService("tanstor","KS4Q+Fe5C+bzLxuCymZV61dMkvbiDQuwqmkiaUAA23agTyI69ijoBsfATM96cMiwytAXlAHcmFuCJUqKgafe+Q==");
var fs = require('fs');
var moment = require('moment-timezone');
var date = require('date-and-time');
var containerName = 'rpi-blob-container';

router.get('/getRule', function(req,res,next) { 
	
	var wholeAlertRuleData = [];
	var dataType = "xyz";
	var reqStatus = "OK";
	//log.debug('GET request for Temperature : ' + req);
	
	GetFinalDataFromFile(dataType,res,function(fileData){
	
		var splitData = fileData.toString().split("\n");
		var numberOfRowsInFile = splitData.length;
		log.debug("splitData: "+splitData);
		
		var wholeAlertDataFromBlob = [];
		
		for(var i in splitData){
			if(splitData[i]){
				wholeAlertDataFromBlob.push(splitData[i]);
			}
		}
        for(var i in wholeAlertDataFromBlob){
					
			var individualDataFromBlob = wholeAlertDataFromBlob[i];
			var parseData = JSON.parse(individualDataFromBlob);
			log.debug("ParseDATA" +JSON.stringify(parseData));
			wholeAlertRuleData.push(parseData);
					
		}
		
		log.debug("WHOLEDATA OF ALERT RULES: "+JSON.stringify(wholeAlertRuleData));
		
		res.json({status: reqStatus, results: wholeAlertRuleData});
		log.debug('GET response for gatewayLocations : status = ' + reqStatus);
	})
	
})

router.post('/setRule', function(req,res,next) {
	//log.debug("post request initiated with : ");
	//res.json({status: "OK", results: "hello.."});
	var deviceId = req.body.deviceId;
	var dataType = req.body.dataType;
	var operator = req.body.operator;
	var threshold = req.body.threshold;
	var ruleOutput = req.body.ruleOutput;
	var ruleId = uuid.v4();
	log.debug("post request initiated with : "+ "deviceId: "+deviceId+ " ruleOutput: "+ruleOutput);
	
	var countNoOfRowsInBlob = 0;
	var wholeData = " ";
	var splitData = [];
	
	blobService.getBlobToText('rpi-blob-container', 'my-awesome-text-blob3',function(err, blobContent, blob) {
        if (err) {
            log.error("Couldn't download blob %s");
            log.error(err);
			var data = JSON.stringify({"deviceId":deviceId,"dataType":dataType,"operator":operator,"threshold":threshold,"ruleOutput":ruleOutput,"ruleId":ruleId});
			var ruleData = data;
			log.debug("data needed to be added in blob: "+ruleData);
			blobService.createBlockBlobFromText('rpi-blob-container','my-awesome-text-blob3',ruleData,function(error, result, response){
				if(error){
					log.debug("Couldn't upload string");
					log.error(error);
				} else {
					log.debug('String uploaded successfully');
					res.json({status: "OK", results: "String uploaded successfully.."});
				}
			})
        } else {
			
            log.debug("Sucessfully downloaded blob:");
			//log.debug(typeof blobContent);
			
			var wholeFileDataArray = blobContent.split("\n");
			for(var i in wholeFileDataArray){
				
				if(wholeFileDataArray[i]){
					
					splitData.push(wholeFileDataArray[i]);
				}
			}
			log.debug("Blob data: "+splitData);
			
			for (var i in splitData){
				
				var singleRow = splitData[i];
				
				var parseData = JSON.parse(singleRow);
				var id = parseData.gatewayid;
				
				if(id.indexOf(deviceId) > -1){
					
					//var data = JSON.stringify({"gatewayid":deviceId,"latitude":62.96476533300000,"longitude":82.727356833,"qualityscore":528.411913332500006});
					var data = JSON.stringify({"deviceId":deviceId, "dataType":dataType, "operator":operator, "threshold":threshold, "ruleOutput":ruleOutput,"ruleId":ruleId});
					wholeData += data+"\n"; 
					
				}else{
					
					log.debug("else case when gateway id not matched: "+singleRow);
					wholeData += singleRow+"\n";
					countNoOfRowsInBlob ++;
				}
			}
			log.debug("countNoOfRowsInBlob: "+countNoOfRowsInBlob + " "+"splitData.length: "+splitData.length);
			if(countNoOfRowsInBlob == splitData.length){
				var data = JSON.stringify({"deviceId":deviceId, "dataType":dataType, "operator":operator, "threshold":threshold, "ruleOutput":ruleOutput,"ruleId":ruleId});
				wholeData += data+"\n";
				
			}
			
			log.debug("data needed to be added in blob: "+wholeData);
			
			blobService.createBlockBlobFromText('rpi-blob-container','my-awesome-text-blob3',wholeData,function(error, result, response){
				
				if(error){
					
					log.debug("Couldn't upload string");
					log.error(error);
					
				} else {
					
					log.debug('String uploaded successfully');
					res.json({status: "OK", results: "String uploaded successfully.."});
				}
			})
        }
    })
	
})

router.put('/getalerts', function(req, res, next) {
	
	var wholeAlertData = [];
	var countGatewayId = 0;
	var countTemperatureSensor = 0;
	var countHumiditySensor = 0;
	var countGpsSensor = 0;
	var countSo2Sensor = 0;
	var countNo2Sensor = 0

	var gatewayUniqueId = req.body.gatewayId;
	//var gatewayUniqueId = "b8:27:eb:94:7c:9d";

	var timeDuration = req.body.time;
	//var sensorDataType = req.body.datatype;
	var sensorDataType = req.body.dataType;
    log.debug(gatewayUniqueId+" "+timeDuration+" "+sensorDataType);
	
	var dataType = ["temperature","humidity","so2","no2","gps"];
	log.debug("gatewayUniqueId : "+gatewayUniqueId);
	
	var reqStatus = "OK";
	//log.debug('GET request for Temperature : ' + req);
	
	GetFinalDataFromFile(dataType,res,function(fileData){
		
		var splitData = fileData.toString().split("\n");
		var numberOfRowsInFile = splitData.length;
		log.debug("splitData: "+splitData);
		
		var wholeAlertDataFromBlob = [];
		
		for(var i in splitData){
			
			if(splitData[i]){
				wholeAlertDataFromBlob.push(splitData[i]);
			}
		}
	
        for(var i in  wholeAlertDataFromBlob){
					
			var individualDataFromBlob = wholeAlertDataFromBlob[i];
			var parseData = JSON.parse(individualDataFromBlob);
			log.debug("ParseDATA" +JSON.stringify(parseData))
				
			//log.debug("GatewayId: "+parseData.gatewayid + " Temperature: "+parseData.temperature+ " qualityScore: "+parseData.qualityscore);
			var gatewayId = parseData.gatewayid;
				if(	(gatewayUniqueId ==  "All") || (gatewayUniqueId == gatewayId)){
					if(sensorDataType=="All") {
						wholeAlertData.push(parseData);
					}
			    else {
			    	if(parseData.dataType==sensorDataType){
			    		wholeAlertData.push(parseData);
			    	}
			    }
			}else {
										
				countGatewayId ++;
			}
		}
		if( countGatewayId == numberOfRowsInFile ){
			
			log.debug("required gateway not found in blob data");
			res.json({status: "error", results: "required gateway not found in blob data "});
		}else{
				log.debug("WHOLEDATA OF ALL SENSORS "+JSON.stringify(wholeAlertData));
				res.json({status: reqStatus, results: wholeAlertData});
			
			//res.json({status: reqStatus, results: tempSensor});
				
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

	//var requiredBlobName = dataType+"-metadata-batch"+"/"+year+"/"+month+"/"+date+"/"+hour;
	//var requiredBlobName = dataType+"/"+year+"/"+month+"/"+"25"+"12";
	var requiredBlobName = 'my-awesome-text-blob3';
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
				//var empty = fss.isEmptySync('temperature1.txt');;
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
