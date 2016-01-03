var onRoute;
var map;
var marker;
var markers;
var infoWindow;
var defaultCenter;
var currentIcon;
var pinkIcon;
var blueIcon;
var greenIcon;
var polyColor;
var polyStroke;
var lightMapTypeId;
var darkMapTypeId;
var directionsDisplay;
var directionsService;
var placeService;
var geocoder;
var waypts;
var dockSpots;
var time;
var addedTime;
var finalDestination;
var instructList;
var maneuverList;
var currentInstruct; 
var instructLocs;
var steps;
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// google maps api callback - do all the things!
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function initMap() {
	// set icons
	currentIcon = 'images/current.png';
	pinkIcon = 'images/pin-pink.png';
	blueIcon = 'images/pin-blue.png';
	greenIcon = 'images/pin-green.png';
	
	// set style-type ids and poly stylers
	lightMapTypeId = 'lightstyle';
	darkMapTypeId = 'darkstyle';
	polyColor = '#B85096';
	polyStroke = 3;
	waypts = [];
	dockSpots = [];
	instructList = [];
	steps = [];
	maneuverList = [];
	instructLocs = [];
	currentInstruct = 0;
	
	// set a default center: chicago; zoomed out to general midwest
	defaultCenter = new google.maps.LatLng({lat: 41.8369, lng: -87.6847});
	
	// init directions service, style polyline
	directionsService = new google.maps.DirectionsService();
	directionsDisplay = new google.maps.DirectionsRenderer({
		polylineOptions: {
			strokeColor: polyColor,
			strokeWeight: polyStroke
		}
	});
	
	// init the map
	map = new google.maps.Map(document.getElementById('map'), {
		center: defaultCenter,
		zoom: 6,
		disableDefaultUI: true,
		mapTypeControlOptions: {
			mapTypeIds: [lightMapTypeId, darkMapTypeId]
    	}
	});
	
	geocoder = new google.maps.Geocoder;
	
	// apply directions display
	directionsDisplay.setMap(map);

	// register stylers and set the initial map styles	
	setStyleTypes();
	map.setMapTypeId(lightMapTypeId);

	// init the infowindow to display in case of geolocation error
	infoWindow = new google.maps.InfoWindow();
	
	// try geolocation - center map, set marker
	setCurrentLocation();
	
	// revv up the places library
	placeService = new google.maps.places.PlacesService(map);
	
	// get a places searchbox going
	makePlacesSearch('search-box');
};


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// get current location, recenter
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function setCurrentLocation(p) {
	// try geolocation
	if (navigator.geolocation) 
	{
		navigator.geolocation.getCurrentPosition(function(position) {
			var pos = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};
			map.setCenter(pos);
			marker = new google.maps.Marker({
				position: pos,
				map: map,
				title: 'Your Location',
				icon: currentIcon
			});		
			if (p) {
				p(pos);
			}
		}, 
		function() { handleLocationError(true, infoWindow, map.getCenter()); });
	} 
	else 
	{
		// Browser doesn't support Geolocation
		handleLocationError(false, infoWindow, map.getCenter());
	}
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// handle geolocation errors
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
  		'Error: The Geolocation service failed.' :
  		'Error: Your browser doesn\'t support geolocation.');
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// change between map styles
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function changeStyles(which) {
	if (which == 'night') {
		map.setMapTypeId(darkMapTypeId);
	}
	else {
		map.setMapTypeId(lightMapTypeId);
	}
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// calculate route, show directions
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function calcRoute() {
	var start = 'chicago il';
	var end = 'st louis mo';
	var request = {
		origin:start,
	    destination:end,
	    travelMode: google.maps.TravelMode.DRIVING
	};
	directionsService.route(request, function(result, status) {
	    if (status == google.maps.DirectionsStatus.OK) {
	      	directionsDisplay.setDirections(result);
	      	console.log(result.routes[0].legs[0].start_address);
	    }
	});
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// calculate route, show directions
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function calcRouteFrom(st, fin) {
	var start = st;
	var end = fin;
	var request = {
		origin:start,
	    destination:end,
	    travelMode: google.maps.TravelMode.DRIVING
	};
	directionsService.route(request, function(result, status) {
	    if (status == google.maps.DirectionsStatus.OK) {
	      	directionsDisplay.setDirections(result);
	      	console.log(result.routes[0].legs[0].steps);
	      	for (var i = 0; i < result.routes[0].legs[0].steps.length; i++)
			{
				instructLocs[i] = { lat: result.routes[0].legs[0].steps[i].start_location.lat(), lng: result.routes[0].legs[0].steps[i].start_location.lng() };
				instructList[i] = result.routes[0].legs[0].steps[i].instructions;
				maneuverList[i] = result.routes[0].legs[0].steps[i].maneuver;
			}
	    }
	});
};

function calcRouteForTime(st, fin, f, x) {
/*
	var start = st;
	var end = fin;
*/
	var request;
	if (x != null) {
		waypts.push({
			location: fin,
			stopover: false
		});
		request = {
			origin: st,
			destination: finalDestination.formatted_address,
			waypoints: waypts,
			travelMode: google.maps.TravelMode.DRIVING
		};
	}
	else {
		request = {
			origin: st,
		    destination: fin,
		    travelMode: google.maps.TravelMode.DRIVING
		};
	}
	directionsService.route(request, function(result, status) {
	    if (status == google.maps.DirectionsStatus.OK) {
	      	console.log(result);
	      	time = result.routes[0].legs[0].duration.text;
	      	console.log(time);
	      	if (f != null) {
		      	f();
	      	}
	      	if (x != null) {
		      	x();
	      	}
	    }
	});
};

function clearMarkers() {
	
	for (var i = 0; i < markers.length; i++)
	{
		markers[i].setMap(null);
	}
		
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// reverse geocoding
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function geocodeLatLng(geocoder, map, infowindow, get) {
	var address = "";
	var latlng = {lat: 0, lng: 0};
	setCurrentLocation(function(p) { 
		latlng = {lat: p.lat, lng: p.lng};
		geocoder.geocode({'location': latlng}, function(results, status) {
			if (status === google.maps.GeocoderStatus.OK) {
				if (results[0]) {
					map.setZoom(11);
			        var marker = new google.maps.Marker({
			          position: latlng,
			          map: map
			        });
			        
					if (get) { 
						clearMarkers(); 
						calcRouteFrom(results[0].formatted_address, finalDestination.formatted_address);
					}
					//infowindow.setContent(results[1].formatted_address);
					//infowindow.open(map, marker);
      			} 
      			else {
	  				window.alert('No results found');
      			}
    		} 
    		else {
				window.alert('Geocoder failed due to: ' + status);
    		}
  		});
	});
};

function geocodeGetTime(geocoder, map, infowindow, place) {
	var address = '';
	var latlng = {lat: 0, lng: 0};
	setCurrentLocation(function(p) { 
		latlng = {lat: p.lat, lng: p.lng};
		geocoder.geocode({'location': latlng}, function(results, status) {
			if (status === google.maps.GeocoderStatus.OK) {
				if (results[0]) {
					if (finalDestination)
					{ 
						calcRouteForTime(results[0].formatted_address, place.formatted_address, null, function() {
							document.querySelector('#instruct').innerHTML = '<span style="font-size: 12px">Add This Pitstop?</span><br />' + place.name + '<br /><span style="font-size: 14px">' + time + '</span>';
						});
						return;
					}
					calcRouteForTime(results[0].formatted_address, place.formatted_address, function() { 
						document.querySelector('#instruct').innerHTML = '<span style="font-size: 12px">Get Directions To:</span><br />' + place.name + '<br /><span style="font-size: 14px">' + time + '</span>'; 
						finalDestination = place;
					}, null);
					//infowindow.setContent(results[1].formatted_address);
					//infowindow.open(map, marker);
      			} 
      			else {
	  				window.alert('No results found');
      			}
    		} 
    		else {
				window.alert('Geocoder failed due to: ' + status);
    		}
  		});
	});
};

function showNextDirection() {
	var stepLoc = new google.maps.LatLng({lat: instructLocs[currentInstruct].lat, lng: instructLocs[currentInstruct].lng});
	map.setZoom(17);
	map.setCenter(stepLoc);
	document.querySelector('#instruct').innerHTML = instructList[currentInstruct];
	console.log(instructList[currentInstruct], maneuverList[currentInstruct]);
	currentInstruct++;
	
};

function addressToRoute(address) {
	calcRouteFrom(address, input);
};

function makePlacesSearch(inputId) {
	var input = document.getElementById(inputId);
	var placesBox = new google.maps.places.SearchBox(input);
	map.controls[google.maps.ControlPosition.TOP].push(input);
	
	map.addListener('bounds_changed', function() {
    	placesBox.setBounds(map.getBounds());
  	});

  	// init markers array
  	markers = [];
  	
  	// Listen for the event fired when the user selects a prediction and retrieve
  	// more details for that place.
  	placesBox.addListener('places_changed', function() {
    	var places = placesBox.getPlaces();
		if (places.length == 0) {
			return;
    	}

		// clear out old markers
	    markers.forEach(function(marker) {
	      marker.setMap(null);
	    });
		
		markers = [];

		// for each place, get the icon, name and location
		var bounds = new google.maps.LatLngBounds();
		
		places.forEach(function(place) {
			console.log(place);
			var icon = {
		        url: place.icon,
		        size: new google.maps.Size(71, 71),
		        origin: new google.maps.Point(0, 0),
		        anchor: new google.maps.Point(17, 34),
		        scaledSize: new google.maps.Size(25, 25) 
		    };
		    var thisMarker = new google.maps.Marker({
		        map: map,
		        icon: pinkIcon,
		        title: place.name + ': ' + place.formatted_address,
		        position: place.geometry.location,
		        clickEvents: true	      	
		    });
		    
	      	thisMarker.addListener('click', function() {
		      	//var nameSubstring = this.title.substring(0, this.title.indexOf(':'));
		      	if (finalDestination) {
			      	document.querySelector('#instruct').innerHTML = '<span style="font-size: 12px">Add This Pitstop?</span><br />' + place.name + '<br /><div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>';
		      	}
		      	else { 
			      	document.querySelector('#footer-bar').classList.remove('hidden');
			      	document.querySelector('#instruct').innerHTML = '<span style="font-size: 12px">Get Directions To:</span><br />' + place.name + '<br /><div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>';
			      }
		      	geocodeGetTime(geocoder, map, infoWindow, place);
		     	console.log(this.title, this.position.lat(), this.position.lng());	
	      	});
			// create a marker for each place
			markers.push(thisMarker);
		    if (place.geometry.viewport) {
	        	// only geocodes have viewport
	        	bounds.union(place.geometry.viewport);
	      	} 
	      	else {
	        	bounds.extend(place.geometry.location);
	      	}
    	});
    	map.fitBounds(bounds);
  	});
};

function confirmWaypoint() {
	document.querySelector('#instruct').innerHTML = '<span style="font-size: 12px">Add This Pitstop?</span><br />' + place.name + '<br /><div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>';
};

function distributeWaypointIcons(points) {
		dockSpots = document.getElementsByClassName('dockSpot');
				
		var numWaypoints = points.length;
		
		for (var i = 0; i < numWaypoints; i++) {
			var space = (100 / (numWaypoints + 1)) * (i +1);
 			dockSpots[i].style.marginLeft = 'calc(' + space + '% - 10px)';
		}		
};

// for adding waypoints
// point: location info (maps waypoint)
// onRoute: boolean- make sure currently on route
// redistribute: boolean- space waypoints?
// reorder: boolean- reorder based on user's order?
function addWaypoint(point, onRoute, redistribute, reorder) {
	if (!onRoute) {
		return;
	}
	if (point) {
		//waypts.push(point);
		var newDockSpot = document.createElement('span');
		newDockSpot.classList.add('icon');
		newDockSpot.classList.add('dockSpot');
		document.getElementById('waypoint-grid').appendChild(newDockSpot);
		var newPoint = document.createElement('span');
		newPoint.classList.add('icon');
		newPoint.classList.add('waypoint');
		newPoint.draggable = true;
		newPoint.classList.add('draggable');
		newPoint.classList.add('drag-drop');
		newPoint.setAttribute('data-xpos', '0');
		newPoint.setAttribute('data-x', '0');
		newDockSpot.appendChild(newPoint);
	}
	if (redistribute) {
		distributeWaypointIcons(document.getElementsByClassName('waypoint'));
	}
	if (reorder) {
		var last = 0;
		var pts = reorderWaypoints();
		dockSpots = document.getElementsByClassName('dockSpot');
		for (var i = 0; i < dockSpots.length; i++) 
		{
			while (dockSpots[i].firstChild)
			{
				dockSpots[i].removeChild(dockSpots[i].firstChild);
			}
			//dockSpots[i].removeChild(dockSpots[i].firstChild);
			console.log('removed children of dock ' + (i+1));
		}
		for (var i = 0; i < pts.length; i ++)
		{
			pts[i].setAttribute('data-xpos', dockSpots[i].offsetLeft);

			if (last == pts[i].getAttribute('data-xpos'))
			{
				continue;
			}
			last = pts[i].getAttribute('data-xpos');
			dockSpots[i].appendChild(pts[i]);
		}
		distributeWaypointIcons(pts);

	}
};

function returnOffsetL(element) {
	var rect = element.getBoundingClientRect();
	var elementLeft,elementTop; //x and y
	var scrollTop = document.documentElement.scrollTop?
	                document.documentElement.scrollTop:document.body.scrollTop;
	var scrollLeft = document.documentElement.scrollLeft?                   
	                 document.documentElement.scrollLeft:document.body.scrollLeft;
	elementTop = rect.top+scrollTop;
	elementLeft = rect.left+scrollLeft;
	//return elementLeft;
	return rect.left;
};

function sortByPosition(a, b){
  return a.clientX - b.clientX;
}

function reorderWaypoints() {
	var f = function(x) { return parseInt(x.getAttribute("data-x") || 0) + x.parentNode.offsetLeft; };
	return $(".waypoint").sort(function(a, b) { return f(a) > f(b); });
};

function compare(a,b) {
	return returnOffsetL(a) - returnOffsetL(b);
};