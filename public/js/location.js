var locationInit = function () 
{
	var locationSet = [];

    $.ajax({
		method: 'GET',
		url: '/api/sensorData/v1.0/gatewayLocations'
	}).done(function(data) {

		if (data.status === "OK") {
			console.info ("Number of Gateways : " + data.results.lat.length);
			for (var idx = 0; idx < data.results.lat.length; idx++) {
				gatewayLocation = { lat: data.results.lat[idx], lng: data.results.lng[idx] ,quality: data.results.airQuality[idx]};

				console.info ("Index: " + idx + ", SecurIoT Gateway location/quality: " + JSON.stringify(gatewayLocation));
				locationSet.push (gatewayLocation);
			}
		} else {
			gatewayLocation = { lat: 12.963778, lng: 77.712111, quality: 50 };
		}

		map = new google.maps.Map(document.getElementById('map'), {
			zoom: 5,
			mapTypeId: 'satellite',
			center: gatewayLocation
		});
		/*
		var heatmap = new google.maps.visualization.HeatmapLayer({
  			data: locations
		});
		heatmap.setMap(map);
		*/
		image = '/images/green-dot.png';
		locationSet.forEach(function (location) {
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
				position: location,
				icon: image,
				map: map
			});
		});
	}).fail(function(data) {
		console.log (data);
	});
}
