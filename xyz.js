//.......generating random numbers in required range.........

var random = require("random-js")(); 
var mqtt = require('mqtt')
var moment   = require('moment-timezone');
var Message = require('azure-iot-device').Message;

var simulationStartup = function () {
	connectionType = "local";
	device = "";
	if (process.argv.length >= 4) {
		connectionType = process.argv[2];
		device = process.argv[3];
	}
	//console.log ("Connection type : " + connectionType + ", JSON : " + device);
	switch (connectionType) {
		case "local":
			var localClient  = mqtt.connect('mqtt://localhost')
			localClient.on('connect', function () {
				setInterval(switchMode, 10000);
				setInterval(generateRandomNumber, 2000);
			});
		break;
		case "azure":
			deviceJSON	= JSON.parse(device);
			iotHubName       = deviceJSON.hostName;;
                	protocol         = deviceJSON.protocol;
                	deviceId         = deviceJSON.deviceId;
                	accessKey        = deviceJSON.devicePrimaryKey;

			//console.log (iotHubName, protocol, deviceId);
                	connectionString = 'HostName='+iotHubName+'.azure-devices.net;DeviceId='+deviceId+';SharedAccessKey='+accessKey;
			clientFromConnectionString = require('azure-iot-device-'+protocol).clientFromConnectionString;

			cloudClient = clientFromConnectionString(connectionString);
			cloudClient.open (function (err, result) {
				if (err) {
					console.log ("Device " + deviceId + " failed to connect to Azure IoTHub");
				} else {
					console.log ("Device " + deviceId + " connected to Azure IoTHub");
					setInterval(switchMode, 10*60*1000);
					setInterval(generateRandomNumber, 30*1000);
				}
			});
		break;
		default:
			console.log ("Unknown connection type (" + connectionType + ") : exiting...");
			exit (1);
	}
}

setTimeout (simulationStartup, 5);


var flag = true;
lower_ac = 20;
upper_ac = 50;
lower_mg = 5;
upper_mg = 15;
lower_gy = 5;
upper_gy = 15;
lower_amb = 28;
upper_amb = 38;
lower_so2 = 17;
upper_so2 = 37;
lower_no2 = 17;
upper_no2 = 37;
lower_humidity = 77;
upper_humidity = 80;

var switchMode = function(){
	
	if (flag == true) {
		lower_ac = 1;
		upper_ac = 10;
		lower_mg = 1;
		upper_mg = 10;
		lower_gy = 1;
		upper_gy = 10;
		lower_amb = 23;
		upper_amb = 33;
		lower_so2 = 17;
		upper_so2 = 37;
		lower_no2 = 17;
		upper_no2 = 37;
		lower_humidity = 87;
		upper_humidity = 90;
		flag = false;
	} else {
		lower_ac = 20;
		upper_ac = 50;
		lower_mg = 5;
		upper_mg = 15;
		lower_gy = 5;
		upper_gy = 15;
		lower_amb = 28;
		upper_amb = 38;
		lower_so2 = 67;
		upper_so2 = 77;
		lower_no2 = 77;
		upper_no2 = 87;
		lower_humidity = 77;
		upper_humidity = 80;
		flag = true;
	}
};

var generateRandomNumber = function(sensorTagArr) {
	
	var now = moment();
        var currentTime   = now.tz("America/New_York").format('YYYY-MM-DDTHH:mm:ss.SSSZZ');

	var acx = random.real(lower_ac, upper_ac, true);
	var acy = random.real(lower_ac, upper_ac, true);
	var acz = random.real(lower_ac, upper_ac, true);
	var ac = acx+","+acy+","+acz;
	var finalDataAc = ac+"-"+sensorTagArr+"-"+"accelerometer"+"-"+"G";
/*
	if (connectionType == "local") {	
		localClient.publish('topic/sensor/data/accelerometer', finalDataAc.toString());
	} else if (connectionType == "azure") {
		sensorData = {};
		sensorData.time = currentTime;
		sensorData.dataType = "AC";
		sensorData.data = ac;	
		sensorData.sensorId = deviceId;
		sensorDataMsg = new Message (JSON.stringify(sensorData));
		cloudClient.sendEvent (sensorDataMsg, function (err) {
		});
	}
*/
	
	var mgx = random.real(lower_mg, upper_mg, true);
	var mgy = random.real(lower_ac, upper_mg, true);
	var mgz = random.real(lower_mg, upper_mg, true);
	var mg = mgx+","+mgy+","+mgz;
	var finalDataMg = mg+"-"+sensorTagArr+"-"+"magnetometer"+"-"+"G";
	
	//localClient.publish('topic/sensor/data/magnetometer', finalDataMg.toString());
	
	var gyx = random.real(lower_gy, upper_gy, true);
	var gyy = random.real(lower_gy, upper_gy, true);
	var gyz = random.real(lower_gy, upper_gy, true);
	var gy = gyx+","+gyy+","+gyz;
	var finalDataGy = gy+"-"+sensorTagArr+"-"+"gyroscope"+"-"+"G";
	
	//localClient.publish('topic/sensor/data/gyroscope', finalDataGy.toString());
	
	var amb = random.real(lower_amb, upper_amb, true);
	var finalDataAmb = amb+"-"+sensorTagArr+"-"+"ambientTemperature"+"-"+"C";
	
	//localClient.publish('topic/sensor/data/ambientTemperature', finalDataAmb.toString());
	
	var so2 = random.real(lower_so2, upper_so2, true);
	var finalDataObj = so2+"-"+sensorTagArr+"-"+"objectTemperature"+"-"+"C";
	
	if (connectionType == "local") {	
		localClient.publish('topic/sensor/data/accelerometer', finalDataAc.toString());
	} else if (connectionType == "azure") {
		sensorData = {};
		sensorData.time = currentTime;
		sensorData.dataType = "so2";
		sensorData.so2 = so2;
		sensorData.sensorId = deviceId;
		sensorDataMsg = new Message (JSON.stringify(sensorData));
		cloudClient.sendEvent (sensorDataMsg, function (err) {
		});
	}

	var no2 = random.real(lower_no2, upper_no2, true);
	var finalDataObj = no2+"-"+sensorTagArr+"-"+"objectTemperature"+"-"+"C";
	
	if (connectionType == "local") {	
		localClient.publish('topic/sensor/data/accelerometer', finalDataAc.toString());
	} else if (connectionType == "azure") {
		sensorData = {};
		sensorData.time = currentTime;
		sensorData.dataType = "no2";
		sensorData.no2 = no2;
		sensorData.sensorId = deviceId;
		sensorDataMsg = new Message (JSON.stringify(sensorData));
		cloudClient.sendEvent (sensorDataMsg, function (err) {
		});
	}

	var humidity = random.real(lower_humidity, upper_humidity, true);
	var finalDataObj = humidity+"-"+sensorTagArr+"-"+"objectTemperature"+"-"+"C";

	if (connectionType == "local") {	
		localClient.publish('topic/sensor/data/accelerometer', finalDataAc.toString());
	} else if (connectionType == "azure") {
		sensorData = {};
		sensorData.time = currentTime;
		sensorData.dataType = "humidity";
		sensorData.humidity = humidity;
		sensorData.sensorId = deviceId;
		sensorDataMsg = new Message (JSON.stringify(sensorData));
		cloudClient.sendEvent (sensorDataMsg, function (err) {
		});
	}

	var regEx = /\d+/;
	var latitude = 11.9716 + 3 * deviceId.match(regEx);
	var longitude = 76.5946 + 2 * deviceId.match(regEx);
	var qualityScore = (25 + 10 * deviceId.match(regEx)) % 100;

	var finalDataGps = latitude+"-"+longitude+"-"+sensorTagArr+"-"+"objectTemperature"+"-"+"C";

	if (connectionType == "local") {	
		localClient.publish('topic/sensor/data/accelerometer', finalDataGps.toString());
	} else if (connectionType == "azure") {
		sensorData = {};
		sensorData.time = currentTime;
		sensorData.dataType = "gps";
		sensorData.latitude = latitude;
		sensorData.longitude = longitude;
		sensorData.qualityScore = qualityScore;
		sensorData.sensorId = deviceId;
		sensorDataMsg = new Message (JSON.stringify(sensorData));
		cloudClient.sendEvent (sensorDataMsg, function (err) {
			console.log(JSON.stringify(sensorData));
		});
	}
/*	
	console.log(finalDataObj);
	console.log(finalDataAmb);
	console.log(finalDataGy);
	console.log(finalDataMg);
	console.log(finalDataAc);
*/
}
