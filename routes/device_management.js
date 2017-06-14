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
var fs = require('fs'); 
var Registry = require('azure-iothub').Registry;
var Client = require('azure-iothub').Client;

var wholeConfigData = fs.readFileSync('./routes/config.txt');
var parsedConfigData = JSON.parse(wholeConfigData);

var HostName = parsedConfigData.HostName;
var SharedAccessKeyName = parsedConfigData.SharedAccessKeyName;
var SharedAccessKey = parsedConfigData.SharedAccessKey;

var connectionString = 'HostName='+HostName+';SharedAccessKeyName='+SharedAccessKeyName+';SharedAccessKey='+SharedAccessKey;

var registry = Registry.fromConnectionString(connectionString);
var client = Client.fromConnectionString(connectionString);
var express = require('express');
var router = express.Router();

// get device related info...

router.get('/hostNameDevicePrimaryKey/:deviceId', function(req,res,next){ 
	var deviceId = req.params.deviceId;
	registry.get(deviceId, function (err, dev) {
		if (err){
			
			log.debug(err);
			res.json({status: "error", results: "error: "+err });
		}else {
			var devicePrimaryKey = dev.authentication.symmetricKey.primaryKey;
			log.debug("devicePrimaryKey: "+devicePrimaryKey);
			
			var hostNameDevicePrimaryKey = {};
			hostNameDevicePrimaryKey = {"hostName" : HostName, "devicePrimaryKey": devicePrimaryKey};
			log.debug(JSON.stringify(hostNameDevicePrimaryKey));
			
			res.json({status: "OK", results: hostNameDevicePrimaryKey});
      
		}
	});

})

//create a new device...

router.post('/createDevice/:deviceId', function(req,res,next){ 

	var uniqueDeviceId = req.params.deviceId;
	var device = {
		deviceId: uniqueDeviceId,
	};
	registry.create(device, function (err, dev) {
		
		if (err){
			log.debug(err);
			res.json({status: "error", results: "error: "+err });
		}else {
			log.debug(uniqueDeviceId);
			res.json({status: "OK", results: "device created with Id: "+uniqueDeviceId});
		}
	});
})

//delete an existing device...

router.delete('/deleteDevice/:deviceId', function(req,res,next){ 

	var uniqueDeviceId = req.params.deviceId;
	registry.delete(uniqueDeviceId, function(err) {
		
		if (err){
			log.debug("Device {" + uniqueDeviceId + ") delete failed : " + err);
			res.json({status: "error", results: "error: "+err });
		}else {
			log.debug("Device {" + uniqueDeviceId + ") deleted : " + uniqueDeviceId);
			res.json({status: "OK", results: "device deleted with Id: "+uniqueDeviceId});
		}
	});
})

//Update an IoT device...

router.post('/updateDevice/:deviceId', function(req,res,next){

	var device = {
		deviceId: req.params.deviceId,
		status: req.body.deviceStatus
	};
	registry.update (device, function (err, dev) {

		if (err){
			log.debug("Device {" + device.deviceId + ") update failed : " + err);
			res.json({status: "error", results: "error: "+err });
		}else {
			log.debug("Device {" + device.deviceId + ") updated : " + JSON.stringify (dev));
			res.json({status: "OK", results: "device created with Id: "+device.deviceId});
		}
	});
})

// fetch config from device twin for all existing devices in iot-hub...

router.get('/deviceId', function(req, res, next) {
	log.debug("get request");
	var deviceInfoArray = [];
	var currentDeviceCount = 0;
	var query = registry.createQuery('SELECT * FROM devices');
	var onResults = function(err, results) {
	
		if (err) {
			log.error('Failed to fetch the results: ' + err.message);
		} else {

			var totalDeviceCount = results.length;
			log.debug (totalDeviceCount);

			results.forEach(function(twin) {

				if (twin.properties.reported.SystemStatus === undefined) {
					var deviceStatusInfo = {};
					deviceStatusInfo.gatewayId = twin.deviceId;
					deviceStatusInfo.location = twin.tags.location;
				} else {
					var deviceStatusInfo = {};
					deviceStatusInfo = twin.properties.reported.SystemStatus;
					deviceStatusInfo.gatewayId = twin.deviceId;
					deviceStatusInfo.location = twin.tags.location;
				}

				registry.get(twin.deviceId, function (err, dev) {

				   currentDeviceCount ++;
					if (err) {
						log.error('Failed to get device state for ' + twin.deviceId + ' : ' + err.message);
						log.debug (JSON.stringify (deviceStatusInfo));
						deviceInfoArray.push(deviceStatusInfo);
						if (currentDeviceCount == totalDeviceCount) {
							res.json({status: "OK", results: deviceInfoArray});
						}
					} else {
						deviceStatusInfo.status = dev.status;
						deviceStatusInfo.connectionState = dev.connectionState;
						log.debug (JSON.stringify (deviceStatusInfo));
						deviceInfoArray.push(deviceStatusInfo);
						if (currentDeviceCount == totalDeviceCount) {
							res.json({status: "OK", results: deviceInfoArray});
						}
					}
				});
			});
			if (query.hasMoreResults) {
				query.nextAsTwin(onResults);
			}
		}
	};
	query.nextAsTwin(onResults);
});

// fetch system config from device twin for particular devices in iot-hub...

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

//send command to gateway form azure-app....

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
//update desired twin property for particular device or devices...

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
