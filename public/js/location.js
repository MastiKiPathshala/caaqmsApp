/*************************************************************************
 *
 * $file: location.js
 *
 * @brief: web App back-end code, reading data from blobs and sending
 * it to browser.
 *
 * @author1: Taniya Datta 
 * @author2: Saurabh Singh
 *
 * @date: 15 May 2017 First version of web app back-end code
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 *
 ************************************************************************/
var createMap =function()
{
	var styledMapType = new google.maps.StyledMapType(
            [
              {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
            }
            ],
            {name: 'Styled Map'});
		
		map = new google.maps.Map(document.getElementById('map'), {
			zoom: 4,
			mapTypeId: 'satellite',
			center: { lat:12.963778 , lng: 77.712111 }
		});
		map.mapTypes.set('styled_map', styledMapType);
        map.setMapTypeId('styled_map');
		//var infowindow = new google.maps.InfoWindow();
		/**/

}
var locationInit = function () 
{   createMap();
	var locationSet = [];
	var gateways    =[];
	
    $.ajax({
		method: 'GET',
		url: '/api/sensorData/v1.0/gatewayLocations'
	}).done(function(data) {

		if (data.status === "OK") {
			for(var i = 0; i < data.results.lat.length; i++){
				
				console.log(data.results);
			    gatewayLocation = { gatewayId: data.results.gatId[i], lat: data.results.lat[i], lng: data.results.lng[i] ,quality: data.results.airQuality[i]};
				
			    console.log ("SecurIoT Gateway location: " + JSON.stringify(gatewayLocation));
			    locationSet.push (gatewayLocation);
			    //map.setCenter({ lat:gatewayLocation.lat , lng: gatewayLocation.lng });
				
			}
		} else {
			
			gatewayLocation = { gatewayId: "BLR-CAAQMS-LAB-1" ,lat:12.963778 , lng: 77.712111 ,quality: 30};
			locationSet.push (gatewayLocation);
			console.log(data.results);
		}
		
		

		/*
		var heatmap = new google.maps.visualization.HeatmapLayer({
 			data: locations
		});
		heatmap.setMap(map);
		*/
		var bounds = new google.maps.LatLngBounds();

		locationSet.forEach(function (gatewayLocation) {

			gateways.push({'gatewayId':gatewayLocation.gatewayId});	
			if( gatewayLocation.quality >=60){
					
					image = '/images/green-dot.png';


				}
				else if( gatewayLocation.quality > 40 && gatewayLocation.quality < 60) {
					
					image = '/images/yellow-dot.png';
				}
				else {
					
					image = '/images/red-dot.png';
				}
			marker = new google.maps.Marker({
				position: gatewayLocation,
				icon: image,
				map: map,
				title: gatewayLocation.gatewayId,
                customInfo: gatewayLocation.gatewayId
				
			});
			bounds.extend(marker.getPosition());
			map.fitBounds(bounds);
			zoomChangeBoundsListener = google.maps.event.addListenerOnce(map, 'bounds_changed', function(event) {
        	if (this.getZoom()){
            	this.setZoom(5);
        		}
			});

			marker.addListener('click', function() {
			    //alert(this.getTitle());
				window.localStorage.removeItem(gatewayId+"temperature");
				window.localStorage.removeItem("'"+gatewayId+"so2'");
				window.localStorage.removeItem("'"+gatewayId+"no2'");
				window.localStorage.removeItem("'"+gatewayId+"so2'");
                var gatewayId=this.getTitle();

            	console.log("Item: "+window.localStorage.getItem('gateway'));
            	window.localStorage.setItem('gateway',gatewayId);
            	console.log("Item1: "+window.localStorage.getItem('gateway'));
			 	window.open('analytics.html','_parent');  
          /*return function() {
          infowindow.setContent(gatewayLocation);
          infowindow.open(map, marker);
        }*/
        
   	        
        });
		});
		setTimeout(function(){google.maps.event.removeListener(zoomChangeBoundsListener)}, 20000);
		map.addListener('center_changed', function() { // 3 seconds after the center of the map has changed, pan back to the marker
          window.setTimeout(function() {
            map.panTo(marker.getPosition());
          }, 3000);
        });
		window.localStorage.setItem('gateways',JSON.stringify(gateways));
		
	}).fail(function(data) {
		console.log (data);
	});
}


function getItem()
{  
	return window.localStorage.getItem('gateway');
}

var TemperatureInit = function () 
{   var gatewayId = window.localStorage.getItem('gateway');
	var wholeTempInfo = [];

    $.ajax({
		method: 'GET',
		url: '/api/sensorData/v1.0/temperature/'+gatewayId
	}).done(function(data) {
        
		if (data.status === "OK") {
			for(var i = 0; i < data.results.temp.length; i++){
				
				console.log(data.results);
			    temperatureData = { temperature: data.results.temp[i] ,quality: data.results.airQuality[i]};
			    var key1=gatewayId+"temperature_dashboard";
			    window.localStorage.setItem(key1,temperatureData.temperature);

			    console.log ("SecurIoT temperature data: " + JSON.stringify(temperatureData));
			    wholeTempInfo.push (temperatureData);

			    var key=gatewayId+"temperature";

			    if(temperatureData.quality>=60)
			    	{
			    	 	window.localStorage.setItem(key,"green");
					}	
					else if(temperatureData.quality>=40 && temperatureData.quality<60)
			   		{
			   		 	window.localStorage.setItem(key,"yellow");
					}
					else
					{
			    		window.localStorage.setItem(key,"red");
					}
	
				
			}
		} else {
			window.localStorage.setItem(key,"grey");
			console.log(data.results);
		}
		
	}).fail(function(data) {
		console.log (data);
	});
}

var HumidityInit = function () 
{   var gatewayId = window.localStorage.getItem('gateway');
	var wholeHumidInfo = [];

    $.ajax({
		method: 'GET',
		url: '/api/sensorData/v1.0/humidity/'+gatewayId
	}).done(function(data) {

		if (data.status === "OK") {
			for(var i = 0; i < data.results.humid.length; i++){
				
				console.log(data.results);
				humidityData = { humidity: data.results.humid[i],quality: data.results.airQuality[i]};
				
			    console.log ("SecurIoT humidity data: " + JSON.stringify(humidityData));
			    wholeHumidInfo.push (humidityData);
			    
			     var key=gatewayId+"humidity";
			    
			    if(humidityData.quality>=60)
			    {
			    		window.localStorage.setItem(key,"green");
				}		
					else if(humidityData.quality>=40 && humidityData.quality<60)
			    {
			   			 window.localStorage.setItem(key,"yellow");
				}
					else
				{
			    		window.localStorage.setItem(key,"red");
				}
			    
				
			}
		} else {
			window.localStorage.setItem(key,"grey");
			console.log(data.results);
		}
		
	}).fail(function(data) {
		console.log (data);
	});
}

var So2Init = function () 
{   var gatewayId = window.localStorage.getItem('gateway');
	var wholeSo2Info = [];

    $.ajax({
		method: 'GET',
		url: '/api/sensorData/v1.0/so2/'+gatewayId
	}).done(function(data) {

		if (data.status === "OK") {
			for(var i = 0; i < data.results.so2.length; i++){
				
				console.log(data.results);
			    so2Data = { so2: data.results.so2[i],quality: data.results.airQuality[i]};
				
			    console.log ("SecurIoT So2 data: " + JSON.stringify(so2Data));
			    wholeSo2Info.push (so2Data);

			     var key=gatewayId+"so2";
			    if(so2Data.quality>=60)
			    {
			    		window.localStorage.setItem(key,"green");
				}
					else if(so2Data.quality>=40 && so2Data.quality<60)
			    {
			    		window.localStorage.setItem(key,"yellow");
				}
					else
				{
			    		window.localStorage.setItem(key,"red");
				}
			    
				
			}
		} else {
			window.localStorage.setItem(key,"grey");
			console.log(data.results);
			
		}
		
	}).fail(function(data) {
		console.log (data);
	});
}

var No2Init = function () 
{	var gatewayId = window.localStorage.getItem('gateway');
	var wholeNo2Info = [];

    $.ajax({
		method: 'GET',
		url: '/api/sensorData/v1.0/no2/'+gatewayId
	}).done(function(data) {

		if (data.status === "OK") {
			for(var i = 0; i < data.results.no2.length; i++){
				
				console.log(data.results);
			    no2Data = { no2: data.results.no2[i], quality: data.results.airQuality[i]};
				
			    console.log ("SecurIoT No2 data: " + JSON.stringify(no2Data));
			    wholeNo2Info.push (no2Data);

			     var key=gatewayId+"no2";
			    
			    if(no2Data.quality>=60)
			    {
			   		 window.localStorage.setItem(key,"green");
				}	
					else if(no2Data.quality>=40 && no2Data.quality<60)
			    {
			   		 	window.localStorage.setItem(key,"yellow");
				}
					else
				{
			    	 	window.localStorage.setItem(key,"red");
				}
			    
				
			}
		} else {
			window.localStorage.setItem(key,"grey");
			//alert(data.results);
		}
		
	}).fail(function(data) {
		console.log (data);
	});
}
