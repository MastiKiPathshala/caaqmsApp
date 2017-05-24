var locationInit = function () 
{
	var locationSet = [];
	var locationString = 'Kolkata, West Bengal, India';

    $.ajax({
		method: 'GET',
		//url: 'http://maps.google.com/maps/api/geocode/json?address=' + locationString + '&sensor=false'
		url: '/api/sensorData/v1.0/gatewayLocations'
	}).done(function(data) {

		if (data.status === "OK") {
			gatewayLocation = { lat: data.results[0].lat, lng: data.results[0].lng };
			console.log ("SecurIoT Gateway location: " + JSON.stringify(gatewayLocation));
		} else {
			gatewayLocation = { lat: 12.963778, lng: 77.712111 };
		}
		locationSet.push (gatewayLocation);

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
		locationSet.forEach(function (gatewayLocation) {
			marker = new google.maps.Marker({
				position: gatewayLocation,
				icon: image,
				map: map
			});
		});
	}).fail(function(data) {
		console.log (data);
	});
}
