var locationInit = function () 
{
	var locationSet = [];

    $.ajax({
		method: 'GET',
		url: '/api/sensorData/v1.0/gatewayLocations'
	}).done(function(data) {

		if (data.status === "OK") {
			for(var idx = 0; idx < data.results.lat.length; idx++){
				
				console.log(data.results);
			    gatewayLocation = { lat: data.results.lat[idx], lng: data.results.lng[idx] ,quality: data.results.airQuality[idx]};
				
			    console.log ("SecurIoT Gateway location: " + JSON.stringify(gatewayLocation));
			    locationSet.push (gatewayLocation);
				
			}
		} else {
			
			gatewayLocation = { lat: 12.963778, lng: 77.712111 };
		}
		

		map = new google.maps.Map(document.getElementById('map'), {
			zoom: 5,
			mapTypeId: 'satellite',
			center: gatewayLocation
		});
		var infowindow = new google.maps.InfoWindow();
		 map.addListener('center_changed', function() {
          // 3 seconds after the center of the map has changed, pan back to the
          // marker.
          window.setTimeout(function() {
            map.panTo(marker.getPosition());
          }, 3000);
        });

		/*
		var heatmap = new google.maps.visualization.HeatmapLayer({
Â  			data: locations
		});
		heatmap.setMap(map);
		*/
		image = '/images/green-dot.png';
		locationSet.forEach(function (gatewayLocation) {
			if( gatewayLocation.quality <= 40) {
					
					image = '/images/green-dot.png';
				}
				else if( gatewayLocation.quality > 40 && gatewayLocation.quality <= 60) {
					
					image = '/images/yellow-dot.png';
				}
				else {
					
					image = '/images/red-dot.png';
				}
			marker = new google.maps.Marker({
				position: gatewayLocation,
				icon: image,
				map: map,
                //title :'b8:22:e7:11:3b'
			});
		});
		marker.addListener('click', function() {
			var gatewayId=marker.getTitle();
			window.open('analytics.html','_blank');  
			map.setCenter(marker.getPosition());
			/*return function() {
				infowindow.setContent(gatewayLocation);
				infowindow.open(map, marker);
			}*/
			window.localStorage.setItem('gateway',gatewayId);
        });
	}).fail(function(data) {
		console.log (data);
	});
}
function getItem()
{  
	return window.localStorage.getItem('gateway');
}

var TemperatureInit = function () 
{
	var wholeTempInfo = [];

    $.ajax({
		method: 'GET',
		url: '/api/sensorData/v1.0/temperature'
	}).done(function(data) {

		if (data.status === "OK") {
			for(var i = 0; i < data.results.temp.length; i++){
				
				console.log(data.results);
			    temperatureData = { temperature: data.results.temp[i], gatewayId: data.results.gatId[i] ,quality: data.results.airQuality[i]};
				
			    console.log ("SecurIoT temperature data: " + JSON.stringify(temperatureData));
			    wholeTempInfo.push (temperatureData);
				
			}
		} else {
			
			
		}
		
	}).fail(function(data) {
		console.log (data);
	});
}

var HumidityInit = function () 
{
	var wholeHumidInfo = [];

    $.ajax({
		method: 'GET',
		url: '/api/sensorData/v1.0/humidity'
	}).done(function(data) {

		if (data.status === "OK") {
			for(var i = 0; i < data.results.humid.length; i++){
				
				console.log(data.results);
				humidityData = { humidity: data.results.humid[i], gatewayId: data.results.gatId[i] ,quality: data.results.airQuality[i]};
				
			    console.log ("SecurIoT humidity data: " + JSON.stringify(humidityData));
			    wholeHumidInfo.push (humidityData);
				
			}
		} else {
			
			
		}
		
	}).fail(function(data) {
		console.log (data);
	});
}

var So2Init = function () 
{
	var wholeSo2Info = [];

    $.ajax({
		method: 'GET',
		url: '/api/sensorData/v1.0/so2'
	}).done(function(data) {

		if (data.status === "OK") {
			for(var i = 0; i < data.results.so2.length; i++){
				
				console.log(data.results);
			    so2Data = { so2: data.results.so2[i], gatewayId: data.results.gatId[i] ,quality: data.results.airQuality[i]};
				
			    console.log ("SecurIoT So2 data: " + JSON.stringify(so2Data));
			    wholeTempInfo.push (so2Data);
				
			}
		} else {
			
			
		}
		
	}).fail(function(data) {
		console.log (data);
	});
}

var No2Init = function () 
{
	var wholeNo2Info = [];

    $.ajax({
		method: 'GET',
		url: '/api/sensorData/v1.0/no2'
	}).done(function(data) {

		if (data.status === "OK") {
			for(var i = 0; i < data.results.no2.length; i++){
				
				console.log(data.results);
			    no2Data = { no2: data.results.no2[i], gatewayId: data.results.gatId[i] ,quality: data.results.airQuality[i]};
				
			    console.log ("SecurIoT No2 data: " + JSON.stringify(no2Data));
			    wholeTempInfo.push (no2Data);
				
			}
		} else {
			
			
		}
		
	}).fail(function(data) {
		console.log (data);
	});
}
