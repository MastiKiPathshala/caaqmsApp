/*************************************************************************
 *
 * $file: device_schedule.js
 *
 * @brief: web App back-end code, for schedulig job and 
 * scheduling twin update.
 *
 * @author: Saurabh Singh
 *
 * @date: 15 May 2017 First version of web app back-end code
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
var uuid = require('uuid');
var JobClient = require('azure-iothub').JobClient;
var connectionString = 'HostName=caaqms-gateway-hub.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=HTqgcjys0HIuyy1mQjICa3OIolsCE1jMub5C+3isFRY=';
var startTime = new Date();

var jobClient = JobClient.fromConnectionString(connectionString);
var express = require('express');
var router = express.Router();

router.post('/scheduleJob', function(req, res, next) {

	var deviceId = req.body.deviceid;
	var methodName = req.body.taskname;
	var payload = req.body.payload;
	var responseTimeoutInSeconds = req.body.responseTimeoutInSeconds;
	var maxExecutionTimeInSeconds = req.body.maxExecutionTimeInSeconds;
	//var startTime = req.body.startTime;
	var parseDeviceId = JSON.parse(deviceId);
	var deviceIdList = parseDeviceId.id;
	log.debug(deviceIdList+" "+methodName+" "+payload+" "+responseTimeoutInSeconds+" "+maxExecutionTimeInSeconds+" "+startTime);
	
	var methodParams = {
		
		methodName: methodName,
		payload: payload,
		responseTimeoutInSeconds: responseTimeoutInSeconds
	}
	function monitorJob (jobId, callback) {
		var jobMonitorInterval = setInterval(function() {
			jobClient.getJob(jobId, function(err, result) {
				if (err) {
					log.error('Could not get job status: ' + err.message);
				} else {
					log.debug('Job: ' + jobId + ' - status: ' + result.status);
					if (result.status === 'completed' || result.status === 'failed' || result.status === 'cancelled') {
						clearInterval(jobMonitorInterval);
						callback(null, result);
					}
				}
			});
		}, 5000);
	}
	var startJobSchedulingOnDevice = function(uniqueDeviceId) {
		var queryCondition = "deviceId IN ['"+uniqueDeviceId+"']";
		log.debug(" startJobSchedulingOnDevice queryCondition: "+queryCondition);
		var methodJobId = uuid.v4();
		log.debug('scheduling Device Method job with id: ' + methodJobId+ " -:methodParams: "+ methodParams+" -:startTime: "+ startTime+" -:maxExecutionTimeInSeconds: "+ maxExecutionTimeInSeconds );
		jobClient.scheduleDeviceMethod(methodJobId,
										queryCondition,
										methodParams,
										startTime,
										maxExecutionTimeInSeconds,
										function(err) {
			if (err) {
				log.error('Could not schedule device method job: ' + err.message);
			} else {
				monitorJob(methodJobId, function(err, result) {
					if (err) {
						log.error('Could not monitor device method job: ' + err.message);
					} else {
						log.debug(JSON.stringify(result, null, 2));
					}
				});
			}
		});
		
	}
	
	for(var list in deviceIdList){
		
		log.debug("device list: "+deviceIdList[list]);	
		startJobSchedulingOnDevice(deviceIdList[list]);
	}
})


router.post('/scheduleTwinUpdate', function(req, res, next) {
	
	var deviceId = req.body.deviceid;
	var methodName = req.body.taskname;
	var payload = req.body.payload;
	var responseTimeoutInSeconds = req.body.responseTimeoutInSeconds;
	var maxExecutionTimeInSeconds = req.body.maxExecutionTimeInSeconds;
	//var startTime = req.body.startTime;
	var parseDeviceId = JSON.parse(deviceId);
	var deviceIdList = parseDeviceId.id;
	log.debug(deviceIdList+" "+methodName+" "+payload+" "+responseTimeoutInSeconds+" "+maxExecutionTimeInSeconds+" "+startTime);
	
	var patch = {
		etag: '*',
		desired: {
			building: '43',
			floor: 3
		}
	};
	function monitorJob (jobId, callback) {
		var jobMonitorInterval = setInterval(function() {
			jobClient.getJob(jobId, function(err, result) {
				if (err) {
					log.error('Could not get job status: ' + err.message);
				} else {
					log.debug('Job: ' + jobId + ' - status: ' + result.status);
					if (result.status === 'completed' || result.status === 'failed' || result.status === 'cancelled') {
						clearInterval(jobMonitorInterval);
						callback(null, result);
					}
				}
			});
		}, 5000);
	}
	var startTwinSchedulingOnDevice = function(uniqueDeviceId) {
		
		var queryCondition = "deviceId IN ['"+uniqueDeviceId+"']";
		log.debug("queryCondition:twinn query type "+ queryCondition);
		var jobId = uuid.v4();
		var jobStartTime = startTime;
		log.debug('scheduling Twin Update job with id: ' +typeof jobId+ " -:methodParams: "+typeof patch+" -:startTime: "+typeof jobStartTime+" -:maxExecutionTimeInSeconds: "+typeof maxExecutionTimeInSeconds );
		log.debug('scheduling Twin Update job with id: ' + jobId+ " "+JSON.stringify(patch)+" "+startTime+" "+maxExecutionTimeInSeconds );
		var type = 'scheduleTwinUpdate';
		log.debug('scheduling Twin Update job with id: ' + jobId);
		jobClient.scheduleTwinUpdate(jobId,
                            queryCondition,
							type,
                            patch,
                            jobStartTime,
                            maxExecutionTimeInSeconds,
                            function(err) {
								
						
			if (err) {
				log.error('Could not schedule twin update job: ' + err.message);
			} else {
				monitorJob(twinJobId, function(err, result) {
					if (err) {
						log.error('Could not monitor twin update job: ' + err.message);
					} else {
						log.debug(JSON.stringify(result, null, 2));
					}
				});
			}
		});
		
	}
	
	for(var list in deviceIdList){
		log.debug("device list: "+deviceIdList[list]);
		//setInterval(function(){
			
			startTwinSchedulingOnDevice(deviceIdList[list])
		//}, 3000);
		//startTwinSchedulingOnDevice(deviceIdList[list]);
	}
})

module.exports = router; 