var map;
var myLatLng;
var marker;
var chicago;
var stl;
var directionsDisplay;
var request;
var directionsService;
var waypts;
var runningTotal;
var route;
var legs;
var steps = [];
var distances = [];
var endlat, endlng;
var locs = [];
var newmarker;
function initMap() {
	chicago = {lat: 41.85, lng: -87.65};
	stl = {lat: 38.6272, lng: -90.1978};
	waypts = [{location: "peoria, il", stopover: true}];
	
	// Create a map object and specify the DOM element for display.
	map = new google.maps.Map(document.getElementById('map'), {
		center: chicago,
		zoom: 12
	});
	
	// Create a marker and set its position.
	marker = new google.maps.Marker({
		map: map,
		position: chicago,
		title: 'Chicago'
	});
	
	directionsDisplay = new google.maps.DirectionsRenderer({
		map: map
	});
	
	// Set destination, origin and travel mode.
	request = {
		destination: stl,
		origin: chicago,
		travelMode: google.maps.TravelMode.DRIVING
	};
	
	// Pass the directions request to the directions service.
	directionsService = new google.maps.DirectionsService();
		directionsService.route(request, function(response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			// Display the route on the map.
			directionsDisplay.setDirections(response);
			//printInfo(response);
		}
	});
};

function printInfo(res) {

	route = res.routes[0];
	legs = res.routes[0].legs;
	stps = [];
	distances = [];
	runningTotal = 0;
	
	for (var i = 0; i < legs.length; i++)
	{
		console.log(legs[i].distance.value);
		for (var j = 0; j < legs[i].steps.length; j++)
		{
			stps.push(legs[i].steps[j]);
			distances.push(legs[i].steps[j].distance.value);
		}
	}

	console.log(stps, distances);
	for (var i = 0; i < legs.length; i++)
	{
		if (legs[i].distance.value > 16000)
		{
			for (var j = 0; j < legs[i].steps.length; j++)
			{
				endlat = legs[i].steps[j].start_location.lat();
				endlng = legs[i].steps[j].start_location.lng();				
			}
		}
	}
	console.log(locs);
};





