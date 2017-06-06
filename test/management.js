/*************************************************************************
 *
 * $file: management.js
 *
 * @brief: web App browser code for testing purpose of scheduling job,
 * triggering commands to gateway,twin update etc.
 * @author: Saurabh Singh
 *
 * @date: 15 May 2017 First version of web app browser code.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
var GetDeviceId = function () {	
    $.ajax({
		method: 'GET',
		url: '/api/deviceManagement/v1.0/deviceId',
	}).done(function(data) {

		if (data.status === "OK") {
			alert(data.results);
			
		} else {
			alert(data.results);
			
		}
		
	}).fail(function(data) {
		console.log (data);
		
	});
}

var GetWholeTwinConfig = function () {	
	var deviceId = 'BLR-CAAQMS-LAB-1';
    $.ajax({
		method: 'GET',
		url: '/api/deviceManagement/v1.0/wholeDeviceTwinConfig/'+deviceId,
	}).done(function(data) {

		if (data.status === "OK") {
			alert(data.results);
			
		} else {
			alert(data.results);
			
		}
		
	}).fail(function(data) {
		console.log (data);
		
	});
}

var TriggerCommandsToGateway = function () {	
	var taskName = "reboot";
    $.ajax({
		method: 'POST',
		url: '/api/deviceManagement/v1.0/sendCommandToGateway',
		data :{
			deviceid : JSON.stringify({ id: ['BLR-CAAQMS-LAB-1','BLR-CAAQMS-LAB-2'] }),
			taskname : taskName,
			payload : null,
			timeoutInSeconds : 30
			
		}
	}).done(function(data) {

		if (data.status === "OK") {
			alert(data.results);
			
		} else {
			alert(data.results);
			
		}
		
	}).fail(function(data) {
		console.log (data);
	});
}

var ScheduleReboot = function () {	
	var deviceId = 'BLR-CAAQMS-LAB-1';
    $.ajax({
		method: 'POST',
		url: '/api/deviceSchedule/v1.0/reboot/'+deviceId,
	}).done(function(data) {

		if (data.status === "OK") {
			alert(data.results);
			
		} else {
			alert(data.results);
			
		}
		
	}).fail(function(data) {
		console.log (data);
	});
}
var TwinUpdate = function () {	
	var taskName = "reboot"
    $.ajax({
		method: 'POST',
		url: '/api/deviceManagement/v1.0/updateDesiredTwinProperty',
		data :{
			deviceid : JSON.stringify({ id: ['BLR-CAAQMS-LAB-1','BLR-CAAQMS-LAB-2'] }),
			twinPatchData : JSON.stringify({tags: { sensorType: "gps" },
										properties: { 
											desired: {
												frequency:{ 
													dataFrequency: '50hz'
												}, 
											}
										}
									})
			
		}
	}).done(function(data) {

		if (data.status === "OK") {
			alert(data.results);
			
		} else {
			alert(data.results);
			
		}
		
	}).fail(function(data) {
		console.log (data);
	});
}

var ScheduleJob = function () {	
	var taskName = "lockDoor";
	alert("hello");
	var time = new Date();
	var startTime = time;
    $.ajax({
		method: 'POST',
		url: '/api/deviceSchedule/v1.0/scheduleJob',
		data :{
			deviceid : JSON.stringify({ id: ['BLR-CAAQMS-LAB-1','BLR-CAAQMS-LAB-2'] }),
			taskname : taskName,
			payload : null,
			responseTimeoutInSeconds : 15,
			maxExecutionTimeInSeconds :60,
			startTime :JSON.stringify({startTime})
			
		}
	}).done(function(data) {

		if (data.status === "OK") {
			alert(data.results);
			
		} else {
			alert(data.results);
			
		}
		
	}).fail(function(data) {
		console.log (data);
	});
}
var ScheduleTwinUpdate = function () {	
	var taskName = "lockDoor";
	var startTime = new Date();
    $.ajax({
		method: 'POST',
		url: '/api/deviceSchedule/v1.0/scheduleTwinUpdate',
		data :{
			deviceid : JSON.stringify({ id: ['BLR-CAAQMS-LAB-1','BLR-CAAQMS-LAB-2'] }),
			taskname : taskName,
			payload : null,
			responseTimeoutInSeconds : 15,
			maxExecutionTimeInSeconds :60,
			startTime : startTime
			
		}
	}).done(function(data) {

		if (data.status === "OK") {
			alert(data.results);
			
		} else {
			alert(data.results);
			
		}
		
	}).fail(function(data) {
		console.log (data);
	});
}