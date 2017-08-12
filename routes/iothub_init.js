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

var async = require('async');
var request = require('request');
var fs = require('fs');
var Registry = require('azure-iothub').Registry;
var Client = require('azure-iothub').Client;
var JobClient = require('azure-iothub').JobClient;
var Storage = require('azure-storage');
uuid = require('uuid');
var azureAccessToken;
var azureAuthHeader;

var AcquireOAuth2Token = function (callback) {
	/*
	 *
	 */
	log.debug ("Acquiring OAuth2 token for initialization");
	authUrl = "https://login.microsoftonline.com/cb76d069-a90e-4c19-92f4-89eb61d54f8e/oauth2/token";
	authForm = {
		client_id: "09220503-e848-4fd6-9972-b25d0496491f",
		client_secret:"fo/s/8qzFgKBYhdQSCgcoUsyhzeXtrRmYvt8YA7dhQw=",
		grant_type:"client_credentials",
		resource: "https://management.azure.com/"
	}
	authHeader = {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length': authForm.length
	}
	request.post ({url: authUrl, headers: authHeader, form: authForm}, function (error, response, body) {
		if (error || response.statusCode != 200) {
			log.error ("Error : " + error + " body : " + body);
			azureAccessToken = null;
		} else {
			azureAccessToken = JSON.parse(body).access_token;
		}
		azureAuthHeader = {
			'Content-Type': 'application/json',
			'Authorization' : 'Bearer ' + azureAccessToken
		}
		callback();
	});
}

var InitializeResourceGroup = function (config, callback) {
	log.debug ("Initializing Resource Group");
	resourceGroup = config.ResourceGroup;
	reqUrl = "https://management.azure.com/subscriptions/f2992d72-a9ff-47e2-875d-7cfa4acaa857/resourcegroups/"+resourceGroup+"?api-version=2017-05-10";
	reqForm = {
		"name": resourceGroup,
		"location": "West US 2"
	}
	request.put ({url: reqUrl, headers: azureAuthHeader, json: reqForm}, function (error, response, body) {
		if (error) {
			log.error ("Error : " + error + " body : " + body);
		} else if (response.statusCode == 200) {
			log.debug ("Job List : " + JSON.stringify(body));
		} else if (response.statusCode == 201) {
                        log.debug ("Job List : " + JSON.stringify(body));
		} else {
                        log.error ("Unknown response - " + response.statusCode + " : " +JSON.stringify(body));
		}
		callback();
	});
}

var InitializeIoTHub = function (config, callback) {

	log.debug ("Initializing IoTHub");

	iotHubName = config.HostName;
	reqUrl = "https://management.azure.com/subscriptions/f2992d72-a9ff-47e2-875d-7cfa4acaa857/resourceGroups/"+resourceGroup+"/providers/Microsoft.Devices/IotHubs/"+iotHubName+"?api-version=2017-01-19";
	reqForm = {
		"name": iotHubName,
		"location": "West US 2",
		"sku": {
			"name": "S1",
			"tier": "Standard",
			"capacity": 1
		}
	}
	request.put ({url: reqUrl, headers: azureAuthHeader, json: reqForm}, function (error, response, body) {
		if (error) {
			log.error ("Error : " + error + " body : " + body);
			callback();
		} else if (response.statusCode == 201) {
			authorizationPolicies = body.properties.authorizationPolicies;
			reqUrl = response.headers["azure-asyncoperation"];
			request ({url: reqUrl, headers: azureAuthHeader}, function (error, response, body) {
				if (error) {
					log.error ("Error 2 : " + error + " body : " + body);
				} else if (response.statusCode == 200) {
					hostName = iotHubConfig.HostName + ".azure-devices.net";
					sharedAccessKeyName = config.SharedAccessKeyName;
					sharedAccessKey = "";
					for (var index in authorizationPolicies) {
						if (authorizationPolicies[index].keyName == sharedAccessKeyName){
							sharedAccessKey = authorizationPolicies[index].primaryKey;
						}
					}
					connectionString = 'HostName='+hostName+';SharedAccessKeyName='+sharedAccessKeyName+';SharedAccessKey='+sharedAccessKey;

					registry = Registry.fromConnectionString(connectionString);
					client = Client.fromConnectionString(connectionString);
					jobClient = JobClient.fromConnectionString(connectionString);
				} else {
					log.error ("Unknown response 2 - " + response.statusCode + " : " +JSON.stringify(body));
				}
				callback();
			});
		} else {
			log.error ("Unknown response - " + response.statusCode + " : " +JSON.stringify(body));
			callback();
		}
	});
}

var InitializeStreamAnalyticsJobs = function (callback) {

	log.debug ("Initializing Stream Analytics jobs");
	reqUrl = "https://management.azure.com/subscriptions/f2992d72-a9ff-47e2-875d-7cfa4acaa857/resourcegroups/"+resourceGroup+"/providers/Microsoft.StreamAnalytics/streamingjobs?$expand={Inputs}&api-version=2015-10-01";
	request({url: reqUrl, headers: azureAuthHeader}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			log.debug ("Job List : " + JSON.stringify(body));
		}else {
			log.error ("Error : " + error + " body : " + body);
		}
		callback();
	});
}

var InitializeStorageConfig = function (storageConfig, blobConfig, callback) {

	log.debug ("Initializing Storage Config");
	storageAccount = storageConfig.account;
	storageAccessKey = storageConfig.SharedAccessKey;
	containerName = storageConfig.container;
	blobService = Storage.createBlobService(storageAccount, storageAccessKey);

	alarmRuleBlob = blobConfig.alarmRule;
	blobService.createContainerIfNotExists(containerName, function(err) {
		if (err) {
			log.error ('Container creation error : ' + JSON.stringify (err));
		} else {
			log.debug ('Container ' + containerName + ' created');
		}
		callback();
	});
}

var configure = function () {

	log.debug("iotHub initialization in progress");
	caaqmsConfig = fs.readFileSync('/root/github/caaqmsApp/config.txt');
	parsedConfig = JSON.parse(caaqmsConfig);
	/*
	 * TODO : If config file is blank, then create IoTHub, Storage Account and populate config file
	 */
	iotHubConfig = parsedConfig.IoTHub;
	log.debug("iotHub Config : " + JSON.stringify(iotHubConfig));
	storageConfig = parsedConfig.Storage;
	log.debug("Storage Config : " + JSON.stringify(storageConfig));
	blobConfig = parsedConfig.Blob;
	log.debug("Blob Config : " + JSON.stringify(blobConfig));


	async.series([

		function(callback) {

			AcquireOAuth2Token(callback);
		},
		function(callback) {

			InitializeResourceGroup (iotHubConfig, callback);
		},
		function(callback) {

			InitializeIoTHub (iotHubConfig, callback);
		},
		function(callback) {

			InitializeStorageConfig (storageConfig, blobConfig, callback);
		},
		function(callback) {

			InitializeStreamAnalyticsJobs(callback);
		}
	]);
}
module.exports.configure = configure;;
