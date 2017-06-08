/*************************************************************************
 *
 * $file: device_management.js
 *
 * @brief: web App back-end code, for fetching config from twin, 
 * updating twin, triggering command from app.
 *
 * @author: Saurabh Singh
 *
 * @date: 31 May 2017 First version of web app back-end code
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
var Registry = require('azure-iothub').Registry;
var Client = require('azure-iothub').Client;
var connectionString = 'HostName=caaqms-gateway-hub.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=HTqgcjys0HIuyy1mQjICa3OIolsCE1jMub5C+3isFRY=';
var registry = Registry.fromConnectionString(connectionString);
var client = Client.fromConnectionString(connectionString);
var express = require('express');
var router = express.Router();

router.get('/deviceId', function(req, res, next) {
	log.debug("get request");
	var deviceInfoArray = [];
	var query = registry.createQuery('SELECT * FROM devices');
	var onResults = function(err, results) {
	
		if (err) {
			log.error('Failed to fetch the results: ' + err.message);
		} else {

			results.forEach(function(twin) {
				var systemStatusInfo = {};
				systemStatusInfo = twin.properties.reported.SystemStatus;
				if( systemStatusInfo != undefined){
					systemStatusInfo.gatewayId = twin.deviceId;
					log.debug("systeminfo: "+JSON.stringify(systemStatusInfo));
					deviceInfoArray.push(systemStatusInfo);
				}
			});
			res.json({status: "OK", results: deviceInfoArray});
			if (query.hasMoreResults) {
				query.nextAsTwin(onResults);
			}
		}
	};
	query.nextAsTwin(onResults);
});

router.get('/wholeDeviceTwinConfig/:deviceId', function(req, res, next) {
	
	var deviceUniqueId = req.params.deviceId;
	log.debug("get request: "+deviceUniqueId);
	var twinConfigArray = [];
	
	var query = registry.createQuery("SELECT * FROM devices WHERE deviceId = '"+deviceUniqueId+"'",100);

	var onResults = function(err, results) {
	
		if (err) {
			log.error('Failed to fetch the results: ' + err.message);
		} else {

			results.forEach(function(twin) {
				
				twinConfigArray.push(twin);
				
				log.debug("wholeDeviceTwinConfig: "+JSON.stringify(twin));
			});
			res.json({status: "OK", results: twinConfigArray});
			if (query.hasMoreResults) {
				query.nextAsTwin(onResults);
			}
		}
	};
	query.nextAsTwin(onResults);
});

router.post('/sendCommandToGateway', function(req, res, next) {
	
	var deviceId = req.body.deviceid;
	var methodName = req.body.taskname;
	var payload = req.body.payload;
	var timeoutInSeconds = req.body.timeoutInSeconds;
	
	var parseDeviceId = JSON.parse(deviceId);
	var deviceIdList = parseDeviceId.id;
	
	log.debug(deviceIdList+" "+methodName+" "+payload+" "+timeoutInSeconds);
	var methodParams = {
		
		methodName: methodName,
		payload: payload,
		timeoutInSeconds: timeoutInSeconds
	}
	
	var startCommandExecutionOnDevice = function(uniqueDeviceId,twin) {
		
		
		log.debug("uniqueDeviceId "+uniqueDeviceId);
		
		client.invokeDeviceMethod(uniqueDeviceId, methodParams, function(err, result) {
			if (err) { 
				log.error("Direct method error: "+err.message);
			} else {
				log.debug("Successfully invoked the device to reboot."+JSON.stringify(result));  
			}
		});
	}

	var queryTwinLastCommandExecution = function(uniqueDeviceId) {

		registry.getTwin(uniqueDeviceId, function(err, twin){

			if (twin.properties.reported.iothubDM != null){
				if (err) {
					log.error('Could not query twins: ' + err.constructor.name + ': ' + err.message);
				} else {
					var lastRebootTime = twin.properties.reported.iothubDM.reboot.lastReboot;
					log.debug('Last reboot time: ' + JSON.stringify(lastRebootTime, null, 2));
				}
			} else 
				log.debug('Waiting for device to report last reboot time.');
		});
	}
	
	for(var li in deviceIdList){
		
		log.debug("dev list: "+deviceIdList[li]);
		startCommandExecutionOnDevice(deviceIdList[li]);
	}
	for(var list in deviceIdList){
		setTimeout(function(){
			
			queryTwinLastCommandExecution(deviceIdList[list])
		}, 2000);
	}

})

router.post('/updateDesiredTwinProperty', function(req, res, next) {
	
	var deviceId = req.body.deviceid;
	var twinPatchdesiredData = req.body.twinPatchData;
	
	var parseDeviceId = JSON.parse(deviceId);
	var deviceIdList = parseDeviceId.id;
	var twinPatch = JSON.parse(twinPatchdesiredData);
	log.debug(deviceIdList+" "+JSON.stringify(twinPatch));
	
	var UpdateDesireTwinProperty = function (uniqueDeviceId){
		
		registry.getTwin(uniqueDeviceId,function(err, twin) {
		
			if (err) {
				log.error('could not get twin');
			} else {
				log.debug('twin acquired');
				twin.update(twinPatch, function(err) {
					if (err) throw err;
					log.debug('Device twin state reported')
				});  
			}
		})
		
	}

	for(var list in deviceIdList){
		
		log.debug("dev list: "+deviceIdList[list]);
		UpdateDesireTwinProperty(deviceIdList[list]);
	}
})
module.exports = router; 