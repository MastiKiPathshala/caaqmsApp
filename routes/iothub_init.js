/*************************************************************************
 *
 * $file: iothub_init.js
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
var configure = function () {
	var fs = require('fs');
	var Registry = require('azure-iothub').Registry;
	var Client = require('azure-iothub').Client;
	var JobClient = require('azure-iothub').JobClient;
	var Storage = require('azure-storage');
	uuid = require('uuid');

	log.debug("iotHub initialization in progress");
	caaqmsConfig = fs.readFileSync('./config.txt');
	parsedConfig = JSON.parse(caaqmsConfig);
	/*
	 * TODO : If config file is blank, then create IoTHub, Storage Account and populate config file
	 */
	iotHubConfig = parsedConfig.IoTHub;
	log.debug("iotHub Config : " + JSON.stringify(iotHubConfig));
	storageConfig = parsedConfig.Storage;
	log.debug("Storage Config : " + JSON.stringify(storageConfig));

	iotHubName = iotHubConfig.HostName;
	SharedAccessKeyName = iotHubConfig.SharedAccessKeyName;
	iotHubAccessKey = iotHubConfig.SharedAccessKey;

	connectionString = 'HostName='+iotHubName+';SharedAccessKeyName='+SharedAccessKeyName+';SharedAccessKey='+iotHubAccessKey;

	registry = Registry.fromConnectionString(connectionString);
	client = Client.fromConnectionString(connectionString);
	jobClient = JobClient.fromConnectionString(connectionString);

	storageAccount = storageConfig.account;
	storageAccessKey = storageConfig.SharedAccessKey;
	containerName = storageConfig.container;
	blobService = Storage.createBlobService(storageAccount, storageAccessKey);

	alarmRuleBlob = 'alarmBlob/alarm-deviceRule-blob.json';

	log.debug("iotHub initialized");
}
module.exports.configure = configure;;
