var async = require ('async');
var fs = require ('fs');
var spawn = require('child_process').spawn;
var request = require ('request');

function setupIoTDeviceTelemetryTest (numDevices, callback) {
	fs.open('/etc/caaqms/iotDeveiceTelemetryTest.txt', 'w', function(err, fd) {
		var numDevicesCreated = 0;
		var deviceConfigArray = [];
		for (index = 1; index <= numDevices; index ++) {
			reqUrl= 'http://127.0.0.1/api/deviceManagement/v1.0/createDevice/' + "SecurIoTTestDevice_" + index;
			request.post ({url: reqUrl}, function (error, response, body) {

				if (error != null) {
					console.log("Error : " + error);
				} else {
					var status = JSON.parse (body).status;
					var deviceConfig = JSON.parse (body).results;
					deviceConfig.protocol = "mqtt";
					console.log("status: " + status + ", results: " + JSON.stringify(deviceConfig));
					numDevicesCreated ++;
					deviceConfigArray.push (deviceConfig);
					if (numDevicesCreated == numDevices) {
						fs.write(fd, JSON.stringify(deviceConfigArray), function (err) {
							console.log ("IoTDeviceTelemetryTest setup complete");
							fs.close (fd, function (err) {
								callback ();
							});
						});
					}
				}
			});
		}
	});
}

function executeIoTDeviceTelemetryTest (numDevices, testDuration, callback) {
	console.log ("Executing tests ......");
	children = [];
	deviceConfig  = fs.readFileSync('/etc/caaqms/iotDeveiceTelemetryTest.txt');
	parsedConfigData = JSON.parse(deviceConfig);

	parsedConfigData.forEach (function (device) {
		var child = spawn('node', ['xyz.js', 'azure', JSON.stringify(device)], { cwd : '/root/github/caaqmsApp/' } );
		children.push (child);
   		child.on('exit', function (code, signal) { 
			console.log ("Code : " + code + ", Signal : " + signal);
			if (code) {
				ret_code = code;
			} 
		});
		child.stdout.on('data', function (data) {

		console.log('stdout:' + data);
		});
		child.stderr.on('data', function (data) {
		console.log('stderr:' + data);
		});
/*
child.stderr.on('data', function (data) {

         data += ' ';
         me.stderr = data.toString();
   });

   child.stdout.on('data', function (data) {

         data += ' ';
         me.stdout = data.toString();
         log.debug(script_name + ': stdout:' + me.stdout);

   });

   child.stdout.on('end', function () {

       if (me.stdout) {
          log.debug(script_name + ': stdout:' + me.stdout);
       }

       if (me.stderr) {
          log.debug(script_name + ': stderr:' + me.stderr);
       }

   });


        child.on('close', function (code) {

                if (code) {ret_code = code;}

                if (ret_code) {
*/
                                                
	});
	setTimeout (function () {
		children.forEach (function (child) {
			child.kill('SIGINT');
		});
		callback ();
	}, testDuration*60*1000);
}

function cleanupIoTDeviceTelemetryTest (numDevices, callback) {
	fs.open('/etc/caaqms/iotDeveiceTelemetryTest.txt', 'w', function(err, fd) {
		fs.close (fd, function (err) {
		});
	});
		var numDevicesDeleted = 0;
		for (index = 1; index <= numDevices; index ++) {
			reqUrl= 'http://127.0.0.1/api/deviceManagement/v1.0/deleteDevice/' + "SecurIoTTestDevice_" + index;
			request.delete ({url: reqUrl}, function (error, response, body) {

				if (error != null) {
					console.log("Error : " + error);
				} else {
					var status = JSON.parse (body).status;
					var results = JSON.parse (body).results;
					console.log("status: " + status + ", results: " + results);
					numDevicesDeleted ++;
					if (numDevicesDeleted == numDevices) {
						console.log ("IoTDeviceTelemetryTest cleanup complete");
						if (callback) {
							callback ();
						}
					}
				}
			});
		}
}

var numGateways = 1;
var testDuration = 10; // in minutes

var testSetupRoutine = function (){
	for (index = 0; index < process.argv.length; index++) {
		if (process.argv[index] == "-n") {
			numGateways = process.argv[index + 1];
		}
		if (process.argv[index] == "-t") {
			testDuration = process.argv[index + 1];
		}
	}
	console.log ('Test Parameter : # of devices - ' + numGateways + ', Duration - ' + testDuration + 'minutes'); 
	async.series([

		function(callback) {

			setupIoTDeviceTelemetryTest (numGateways, callback);
		},
		function(callback) {

			executeIoTDeviceTelemetryTest (numGateways, testDuration, callback);
		},
		function(callback) {

			cleanupIoTDeviceTelemetryTest (numGateways, callback);
		}
	]);
}

setTimeout (testSetupRoutine, 5);

sigIntCounter = 0;

process.on ('SIGINT', function () {
	console.log ("Received SIGINT # " + sigIntCounter++);
	if (sigIntCounter == 3) {
		children.forEach (function (child) {
			child.kill('SIGINT');
		});
		cleanupIoTDeviceTelemetryTest (numGateways, null);
		exit ();
	}
});
