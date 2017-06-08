/*************************************************************************
 *
 * $file: device_schedule.js
 *
 * @brief: web App back-end code, for schedulig job and 
 * scheduling twin update.
 *
 * @author: Saurabh Singh
 *
 * @date: 31 May 2017 First version of web app back-end code
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
	var countNoOfScheduledJobs = 0;
	var countNoOfFailedScheduledJobs = 0;
	var listOfJobId = [];
	
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
		var methodJobId = uuid.v4();
		listOfJobId.push(methodJobId);
		log.debug('scheduling Device Method job with id: ' + methodJobId+ " -:methodParams: "+ methodParams+
		" -:startTime: "+ startTime+" -:maxExecutionTimeInSeconds: "+ maxExecutionTimeInSeconds );
		
		jobClient.scheduleDeviceMethod(methodJobId,
										queryCondition,
										methodParams,
										startTime,
										maxExecutionTimeInSeconds,
										function(err) {
			if (err) {
				log.error('Could not schedule device method job: ' + err.message);
				io.emit('update',{action:'update', status:' Could not schedule job with jobId '+ methodJobId +' failed'});
				countNoOfFailedScheduledJobs++;
				
				if(countNoOfFailedScheduledJobs == (deviceIdList.length)){
					//res.json({status: "error", results: 'Could not schedule any job: ' + err.message});
					res.json({status: "OK", results: listOfJobId});
				}
			} else {
				monitorJob(methodJobId, function(err, result) {
					if (err) {
						log.error('Could not monitor device method job: ' + err.message);
					} else {
						log.debug(JSON.stringify(result, null, 2));
						io.emit('update',{action:'update', status:' job with jobId: '+ methodJobId +' scheduled'});
						countNoOfScheduledJobs ++;
						if(countNoOfScheduledJobs == (deviceIdList.length)){
						
							res.json({status: "OK", results: listOfJobId});
						}
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
	
	var countNoOfScheduledTwinJobs = 0;
	var countNoOfFailedScheduledTwinJobs = 0;
	var listOfTwinJobId = [];
	log.debug(deviceIdList+" "+methodName+" "+payload+" "+responseTimeoutInSeconds+" "+maxExecutionTimeInSeconds+" "+startTime);
	
	var twinPatch = {
		etag: '*',
		properties: {
			desired: {
				building: '43',
				floor: 3
			}
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
		var twinJobId = uuid.v4();	
		listOfTwinJobId.push(twinJobId);
		log.debug('scheduling Twin Update job with id: ' + twinJobId+ " "+JSON.stringify(twinPatch)+" "+startTime+" "+maxExecutionTimeInSeconds );
	
		jobClient.scheduleTwinUpdate(twinJobId,
                            queryCondition,
                            twinPatch,
                            startTime,
                            maxExecutionTimeInSeconds,
                            function(err) {
			if (err) {
				
				log.error('Could not schedule twin update job: ' + err.message);
				io.emit('update',{action:'update', status:' Could not schedule job with jobId '+ twinJobId +' failed'});
				countNoOfFailedScheduledTwinJobs++;
				
				if(countNoOfFailedScheduledTwinJobs == (deviceIdList.length)){
					//res.json({status: "error", results: 'Could not schedule ant twin update job: ' + err.message});
					res.json({status: "OK", results: listOfTwinJobId});
				}
				
			} else {
				
				monitorJob(twinJobId, function(err, result) {
					if (err) {
						log.error('Could not monitor twin update job: ' + err.message);
					} else {
						log.debug(JSON.stringify(result, null, 2));
						io.emit('update',{action:'update', status:'twin update job with jobId: '+ twinJobId +' scheduled'});
						countNoOfScheduledTwinJobs ++;
						if(countNoOfScheduledTwinJobs == (deviceIdList.length)){
						
							//res.json({status: "OK", results: ' All twin update job scheduled'});
							res.json({status: "OK", results: listOfTwinJobId});
						}
					}
				});
			}
		});
		
	}
	
	for(var list in deviceIdList){
		
		log.debug("device list: "+deviceIdList[list]);
		startTwinSchedulingOnDevice(deviceIdList[list]);
	}
})

router.post('/currentJobStatus', function(req, res, next) {

	var jobId = req.body.jobId;
	var parseJobId = JSON.parse(jobId);
	var jobIdList = parseJobId.id;
	
	var countNoOfScheduledJobsStatus = 0;
	var countNoOfFailedScheduledJobs = 0;
	var listOfJobId = [];
	var jobStatusArray = [];
	log.debug(jobIdList);
	
	
	function monitorJob (jobId, callback) {
	
		jobClient.getJob(jobId, function(err, result) {
			if (err) {
				log.error('Could not get job status: ' + err.message);
			} else {
				log.debug('Job: ' + jobId + ' - status: ' + result.status);
				callback(null, result);
			}
		})
	}	
	
	var startJobSchedulingOnDevice = function(uniqueJobId) {
	
		monitorJob(uniqueJobId, function(err, result) {
			if (err) {
				log.error('Could not monitor device method job: ' + err.message);
			} else {
				log.debug(JSON.stringify(result, null, 2));
				jobStatusArray.push(result);
				//io.emit('update',{action:'update', status:' job with jobId: '+ methodJobId +' scheduled'});
				countNoOfScheduledJobsStatus ++;
				if(countNoOfScheduledJobsStatus == (jobIdList.length)){
						
					res.json({status: "OK", results: jobStatusArray});
				}
			}
		});
		
	}
	
	for(var list in jobIdList){
		
		log.debug("device list: "+jobIdList[list]);	
		startJobSchedulingOnDevice(jobIdList[list]);
	}
})

router.post('/cancelScheduledJob', function(req, res, next) {

	var jobId = req.body.jobId;
	var parseJobId = JSON.parse(jobId);
	var jobIdList = parseJobId.id;
	
	var countNoOfCanceledJobs = 0;
	var countNoOfFailedScheduledJobs = 0;
	var listOfJobId = [];
	var jobCancelStatusArray = [];
	log.debug(jobIdList);
	
	
	function cancelJobs (jobId, callback) {
	
		jobClient.cancelJob(jobId, function(err, result) {
			if (err) {
				log.error('Could not cancel jobbb: ' + err.message);
			} else {
				//log.debug('Job: ' + jobId + ' - status: ' + result.status);
				callback(null, result);
			}
		})
	}	
	
	var startJobCancelingOnDevice = function(uniqueJobId) {
	
		cancelJobs(uniqueJobId, function(err, result) {
			if (err) {
				log.error('Could not cancel job: ' + err.message);
			} else {
				
				log.debug(JSON.stringify(result, null, 2));
				jobCancelStatusArray.push(result);
				
				log.debug("result: "+result);
				//io.emit('update',{action:'update', status:' job with jobId: '+ methodJobId +' scheduled'});
				
				countNoOfCanceledJobs ++;
				
				if(countNoOfCanceledJobs == (jobIdList.length)){
						
					res.json({status: "OK", results: jobCancelStatusArray});
				}
			}
		});
		
	}
	
	for(var list in jobIdList){
		
		log.debug("device list: "+jobIdList[list]);	
		startJobCancelingOnDevice(jobIdList[list]);
	}
})
module.exports = router; 