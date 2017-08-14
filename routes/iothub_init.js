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
var msRestAzure = require('ms-rest-azure');
var ResourceManagementClient = require('azure-arm-resource').ResourceManagementClient;
var StorageManagementClient = require('azure-arm-storage');
var Storage = require('azure-storage');
uuid = require('uuid');
var azureAccessToken;
var azureAuthHeader;

var AcquireOAuth2Token = function (config, callback) {
	/*
	 *
	 */
	log.debug ("Acquiring OAuth2 token for initialization");
	clientId = config.ClientId;
	clientSecret = config.ClientSecret;
	tenantId = config.TenantId;
	subscriptionId = config.SubscriptionId;
	authUrl = "https://login.microsoftonline.com/"+tenantId+"/oauth2/token";
	//authUrl = "https://login.microsoftonline.com/common/oauth2/token";
	authForm = {
		client_id: clientId,
		client_secret: clientSecret,
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
	msRestAzure.loginWithServicePrincipalSecret(clientId, clientSecret, tenantId, function (err, credentials) {
		if (err) {
			return console.log(err);
		}
		log.debug ("Logged in with WebApp Service principal credential ");
		resourceClient = new ResourceManagementClient(credentials, subscriptionId);
		storageClient = new StorageManagementClient(credentials, subscriptionId);
	});
}

var InitializeResourceGroup = function (config, callback) {
	log.debug ("Initializing Resource Group");
	resourceGroupName = config.ResourceGroup;
	reqUrl = "https://management.azure.com/subscriptions/"+subscriptionId+"/resourcegroups/"+resourceGroupName+"?api-version=2017-05-10";
	reqForm = {
		"name": resourceGroupName,
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
	reqUrl = "https://management.azure.com/subscriptions/"+subscriptionId+"/resourceGroups/"+resourceGroupName+"/providers/Microsoft.Devices/IotHubs/"+iotHubName+"?api-version=2017-01-19";
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

var InitializeStreamAnalyticsJobs = function (config, callback) {

	log.debug ("Initializing Stream Analytics jobs");
	for (index in config) {
		reqForm = {
			"location":"West US 2",
			"properties":{
				"sku":{
					"name":"standard"
				},
				"eventsOutOfOrderPolicy":"drop",
				"eventsOutOfOrderMaxDelayInSeconds":10
			}
		}
		reqForm.properties["inputs"] = config[index].inputs;
		for (innerIndex in reqForm.properties.inputs) {
			reqForm.properties.inputs[innerIndex].properties.datasource.properties.iotHubNamespace = iotHubName;
			reqForm.properties.inputs[innerIndex].properties.datasource.properties.sharedAccessPolicyName = sharedAccessKeyName;
			reqForm.properties.inputs[innerIndex].properties.datasource.properties.sharedAccessPolicyKey = sharedAccessKey;
		}

		reqForm.properties["transformation"] = config[index].transformation;

		reqForm.properties["outputs"] = config[index].outputs;
		for (innerIndex in reqForm.properties.inputs) {
			reqForm.properties.outputs[innerIndex].properties.datasource.properties.storageAccounts[0].accountName = storageAccountName;
			reqForm.properties.outputs[innerIndex].properties.datasource.properties.storageAccounts[0].accountKey = storageAccessKey;
		}

		streamJobName = config[index].JobName;
		reqUrl = "https://management.azure.com/subscriptions/"+subscriptionId+"/resourcegroups/"+resourceGroupName+"/providers/Microsoft.StreamAnalytics/streamingjobs/"+streamJobName+"?api-version=2015-10-01";
		//log.debug ("Stream Job : " + reqUrl + " Form : " + JSON.stringify(reqForm));

		request.put ({url: reqUrl, headers: azureAuthHeader, json: reqForm}, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				log.debug ("Stream Job List : " + JSON.stringify(body));
			}else {
				log.error ("Stream Job error : " + error + " body : " + JSON.stringify(body));
			}
		});
	}
	callback();
}

var InitializeStorageConfig = function (storageConfig, blobConfig, callback) {

	log.debug ("Storage : Creating or updating Storage account");
	storageAccountName = storageConfig.account;
	containerName = storageConfig.container;
	var createParameters = {
		location: "West US 2",
		sku: {
			name: "Standard_LRS"
		},
		kind: 'BlobStorage',
		accessTier: "Hot"
	};

	storageClient.storageAccounts.create(resourceGroupName, storageAccountName, createParameters, function (err, result, request, response) {
		if (err) {
			log.error ("Storage Account creation failed : " +err);
		}
		storageClient.storageAccounts.listKeys(resourceGroupName, storageAccountName, function (err, result, request, response) {
			if (err) {
				log.error ("Storage Account list error  : " + err);
			} else {
				storageAccessKeys = result.keys;
					storageAccessKey = "";
					for (var index in storageAccessKeys) {
						if (storageAccessKeys[index].keyName == "key1"){
							storageAccessKey = storageAccessKeys[index].value;
						}
					}
			}
	blobService = Storage.createBlobService(storageAccountName, storageAccessKey);

	alarmRuleBlob = blobConfig.alarmRule;
	blobService.createContainerIfNotExists(containerName, function(err) {
		if (err) {
			log.error ('Container creation error : ' + JSON.stringify (err));
		} else {
			log.debug ('Container ' + containerName + ' created');
		}
		callback();
	});
		});
	});

}

var configure = function () {

	log.debug("iotHub initialization in progress");
	caaqmsConfig = fs.readFileSync('/etc/caaqms/config.txt');
	parsedConfig = JSON.parse(caaqmsConfig);
	/*
	 * TODO : If config file is blank, then create IoTHub, Storage Account and populate config file
	 */
	clientConfig = parsedConfig.Client;
	//log.debug("App Client Config : " + JSON.stringify(clientConfig));
	iotHubConfig = parsedConfig.IoTHub;
	log.debug("iotHub Config : " + JSON.stringify(iotHubConfig));
	storageConfig = parsedConfig.Storage;
	log.debug("Storage Config : " + JSON.stringify(storageConfig));
	blobConfig = parsedConfig.Blob;
	log.debug("Blob Config : " + JSON.stringify(blobConfig));
	streamJobsConfig = parsedConfig.StreamJobs;
	//log.debug("Stream Jobs Config : " + JSON.stringify(streamJobsConfig));


	async.series([

		function(callback) {

			AcquireOAuth2Token(clientConfig, callback);
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

			InitializeStreamAnalyticsJobs(streamJobsConfig, callback);
		}
	]);
}
module.exports.configure = configure;;
