// ui
var locIcon;
var menuIcon;
var sideMenu;
var toggleMapStyle;
var searchBox;
var searchForm;
var getNext;
var footer;
var waypointDock;
var dockStart; 
var instruct;
var waypointPath;
var waypointIcons;
var directIcon;
var finalDestIcon;
var onRoute;
var startNav; 

// map
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
var wayptsPrelim;
var dockSpots;
var time;
var addedTime;
var finalDestination;
var instructList;
var maneuverList;
var currentInstruct; 
var instructLocs;
var steps;
var classesToAdd;
var distances;

(function() {
	'use strict';
	
	// init elements
	locIcon = document.getElementById('loc-icon');
	menuIcon = document.getElementById('menu-icon');
	sideMenu = document.getElementById('side-menu');
	//styleBtn = document.getElementById('style-button');
	searchBox = document.getElementById('search-box');
	searchForm = document.getElementById('search-form');
	getNext = document.getElementById('get-next');
	footer = document.getElementById('footer-bar');
	waypointDock = document.getElementById('waypoint-dock');
	dockStart = document.getElementById('dock-start');
	instruct = document.getElementById('instruct');
	waypointPath = document.getElementById('path-icon');
	directIcon = document.getElementById('direction-icon');
	finalDestIcon = document.getElementById('destination-icon');
	waypointIcons = [];
	onRoute = false;
	
	// add event listeners
	locIcon.addEventListener('click', function() {
		//animate the location arrow (thinking!)
		locIcon.classList.add('find');
		//remove animation class after posiiton found
		setCurrentLocation(function(){ locIcon.classList.remove('find'); });
	});
	
	menuIcon.addEventListener('click', function() {
		sideMenu.classList.toggle('open');
	});
	
	getNext.addEventListener('click', function() {
		if (getNext.classList.contains('confirm'))
		{
			confirmWaypoint();
			getNext.classList.remove('confirm');
			showInstruct();
		}
		else if (onRoute) 
		{
			getNext.classList.add('retrieving');
			setTimeout(function() {
				getNext.classList.remove('retrieving');
			}, 200);
			showInstruct();
		}
		else if (!onRoute) 
		{
			geocodeLatLng(geocoder, map, infoWindow, true);
			setTimeout(function() {
				footer.classList.add('expanded');
				waypointDock.classList.add('expanded');
				getNext.classList.add('docked');
				dockStart.classList.add('expanded');
				waypointPath.classList.add('expanded');
				searchBox.placeholder = "Find near route...";
				directIcon.classList.add('show');
				finalDestIcon.classList.add('docked');
				showInstruct();
			}, 1200);
		}
		
	});
	
	
/*
	
	styleBtn.addEventListener('click', function() {
		if (styleBtn.classList.contains('goNight')) {
			changeStyles('night');
		}
		else {
			changeStyles('day');
		}
		styleBtn.classList.toggle('goNight');
		styleBtn.classList.toggle('goDay');
		sideMenu.classList.toggle('open');
	});
*/
	
})();


function showInstruct() {
	instruct.innerHTML = '<button type="button" class="button icon startNav" id="start-nav">Start Navigation</button>';
	if (!onRoute) {
		startNav = document.getElementById('start-nav');
		startNav.addEventListener('click', function() {
			getNext.classList.remove('g20');
			getNext.classList.add('g10');
			getNext.classList.remove('docked');
			getNext.classList.add('growIt');
			setTimeout(function() {
				getNext.classList.add('next');
				getNext.classList.remove('growIt');
			}, 500);
			startNav.classList.add('started');
			onRoute = true;
			showNextDirection();
		});
	}
	else {
		getNext.classList.remove('g20');
		getNext.classList.add('g10');
		getNext.classList.remove('docked');
		getNext.classList.add('growIt');
		setTimeout(function() {
			getNext.classList.add('next');
			getNext.classList.remove('growIt');
		}, 500);
		showNextDirection();

	}
}

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
	markers = [];
	waypts = [];
	dockSpots = [];
	instructList = [];
	steps = [];
	classesToAdd = [];
	maneuverList = [];
	instructLocs = [];
	distances = [];
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
	// try html5 geolocation
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var pos = { lat: position.coords.latitude, lng: position.coords.longitude };
			map.setCenter(pos);
			marker = new google.maps.Marker({
				position: pos,
				map: map,
				title: 'Your Location',
				icon: currentIcon
			});	
			//if a function was passed in for p, call it with params = pos	
			if (p) { 
				p(pos); 
			}
		}, 
		function() { handleLocationError(true, infoWindow, map.getCenter()); });
	} 
	else {
		// browser doesn't support geolocation
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
// directions request (full)
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function calcRoute(start, finish) {
	steps = []; 
	currentInstruct = 0;
	var request = {};
	if (!onRoute) {
		request = {
			origin: start,
			destination: finish,
			travelMode: google.maps.TravelMode.DRIVING
		};
	}
	if (onRoute) {
		request = {
			origin: start,
			destination: finish,
			travelMode: google.maps.TravelMode.DRIVING,
			waypoints: waypts,
			optimizeWaypoints: true	
		};
	}
	directionsService.route(request, function(result, status) {
	    if (status == google.maps.DirectionsStatus.OK) {
	    	directionsDisplay.setDirections(result);
			document.querySelector('#search-box').value = "";
			//console.log(result.routes[0]);
			for (var i = 0; i < result.routes[0].legs.length; i++)
			{	
				var leg = result.routes[0].legs[i];
		    	//console.log(leg);      	
				for (var j = 0; j < leg.steps.length; j++)
				{
					var step = leg.steps[j];
					steps.push({
						dist_value: step.distance.value, 
						dist_text: step.distance.text, 
						loc: { 
							lat: step.start_location.lat(), 
							lng: step.start_location.lng() 
						},
						instruction: step.instructions,
						maneuver: step.maneuver
					});
				}
			}
		    if (onRoute) {
				currentInstruct = 0;
				showNextDirection();
			}
	    }
	});
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// directions request, for eta only
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function calcRouteTime(start, finish, firstFn, addonFn) {
	var request = {
			origin: start,
			destination: finish,
			travelMode: google.maps.TravelMode.DRIVING
	};
	directionsService.route(request, function(result, status) {
	    if (status == google.maps.DirectionsStatus.OK) {
			time = result.routes[0].legs[0].duration.text;
			//console.log(result, time);
			if (firstFn != null) {
				firstFn();
	    	}
			if (addonFn != null) {
				addonFn();
	    	}
	    }
	});
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// clear existing map markers
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function clearMarkers() {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	markers = [];
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// reverse geocoding
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function geocodeLatLng(geocoder, map, infowindow, getRoute, place) {
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
					if (getRoute) { 
						clearMarkers(); 
						calcRoute(results[0].formatted_address, finalDestination.formatted_address);	
					}
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

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// reverse geocoding
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function geocodeGetTime(geocoder, map, infowindow, place) {
	var address = '';
	var latlng = {lat: 0, lng: 0};
	setCurrentLocation(function(p) { 
		latlng = {lat: p.lat, lng: p.lng};
		geocoder.geocode({'location': latlng}, function(results, status) {
			if (status === google.maps.GeocoderStatus.OK) {
				if (results[0]) {
					if (onRoute)
					{ 
						wayptsPrelim = [];
						//wayptsPrelim = waypts;
						wayptsPrelim.push({ location: place.formatted_address, stopover: true });
						calcRouteTime(results[0].formatted_address, place.formatted_address, null, function() {
							document.querySelector('#instruct').innerHTML = '<span style="font-size: 12px">Add This Pitstop?</span><br />' + place.name + '<br /><span style="font-size: 14px">' + time + '</span>';
						});
						getNext.classList.add('confirm');
						return;
					}
					else {
						calcRouteTime(results[0].formatted_address, place.formatted_address, function() { 
							document.querySelector('#instruct').innerHTML = '<span style="font-size: 12px">Get Directions To:</span><br />' + place.name + '<br /><span style="font-size: 14px">' + time + '</span>'; 
							finalDestination = place;
						}, null);
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

function showNextDirection() {
	getNext.classList.remove('done');
	if (currentInstruct == 0) { 
		getNext.classList.add('next'); 
	}
	var stepLoc = new google.maps.LatLng({lat: steps[currentInstruct].loc.lat, lng: steps[currentInstruct].loc.lng });
	map.setCenter(stepLoc);
	map.setZoom(17);
	document.querySelector('#instruct').innerHTML = steps[currentInstruct].instruction;
	//console.log(instructList[currentInstruct], maneuverList[currentInstruct]);
	for (var i = 0; i < classesToAdd.length; i++) {
		directIcon.classList.remove(classesToAdd[i]);
	}
	classesToAdd = [];
	switch(steps[currentInstruct].maneuver) {
		case "turn-left":
			classesToAdd.push('turn');
			classesToAdd.push('left');
			break;
		case "turn-right":
			classesToAdd.push('turn');
			classesToAdd.push('right');
			break;
		case "fork-left":
			classesToAdd.push('fork');
			classesToAdd.push('left');
			break;
		case "fork-right":
			classesToAdd.push('fork');
			classesToAdd.push('right');
			break;
		case "keep-left":
			classesToAdd.push('keep');
			classesToAdd.push('left');
			break;
		case "keep-right":
			classesToAdd.push('keep');
			classesToAdd.push('right');
			break;
		case "ramp-left":
			classesToAdd.push('ramp');
			classesToAdd.push('left');
			break;
		case "ramp-right":
			classesToAdd.push('ramp');
			classesToAdd.push('right');
			break;
		case "merge":
			classesToAdd.push('merge');
			break;
		default:
			var textClass = steps[currentInstruct].instruction.substring(steps[currentInstruct].instruction.indexOf('<b>') + 3, steps[currentInstruct].instruction.indexOf('</'));
			if (textClass != 'right' && textClass != 'left') {
				classesToAdd.push('head');
				if (textClass != 'north' &&  textClass != 'south' && textClass != 'east' && textClass != 'west') { 
					classesToAdd.push('notGiven'); 
					console.log('none');
					break;
				}
			}
			classesToAdd.push(textClass);
			break;
	}
	for (var i = 0; i < classesToAdd.length; i++) {
		directIcon.classList.add(classesToAdd[i]);
	}
	currentInstruct++;
	if (currentInstruct >= steps.length) {
		document.querySelector('#instruct').innerHTML = steps[steps.length - 1].instruction + '<br />(Destination is ' + steps[steps.length - 1].dist_text + ' ahead)';
		getNext.classList.remove('next');
		getNext.classList.add('done');
		currentInstruct = 0;
	}
};


function makePlacesSearch(inputId) {
	var input = document.getElementById(inputId);
	var placesBox = new google.maps.places.SearchBox(input);
	map.controls[google.maps.ControlPosition.TOP].push(input);
	map.addListener('bounds_changed', function() {
    	placesBox.setBounds(map.getBounds());
	});
	// listen for the event fired when the user selects a prediction and retrieve more details for that place
	placesBox.addListener('places_changed', function() {
    	var places = placesBox.getPlaces();
		if (places.length == 0) {
			return;
    	}
		// clear out old markers
	    markers.forEach(function(marker) {
	      marker.setMap(null);
	    });
	    // clear out marker array
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
		    var placeMarker = new google.maps.Marker({
		        map: map,
		        icon: pinkIcon,
		        title: place.name + ': ' + place.formatted_address,
		        position: place.geometry.location,
		        clickEvents: true	      	
		    });	  
		    // click listener for place markers  
			placeMarker.addListener('click', function() {
				wayptsPrelim = [];
				wayptsPrelim[0] = place;
				var spinnerString = '<br /><div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>';
				var promptString = '';
				if (onRoute) {
					promptString = '<span style="font-size: 12px">Add This Pitstop?</span><br />';
				}
				else { 
					document.querySelector('#footer-bar').classList.remove('hidden');
					promptString = '<span style="font-size: 12px">Get Directions To:</span><br />';
				}
				document.querySelector('#instruct').innerHTML = promptString + place.name + spinnerString;
				geocodeGetTime(geocoder, map, infoWindow, place);
				console.log(this.title, this.position.lat(), this.position.lng());	
			});
			// add the new marker to marker array
			markers.push(placeMarker);
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

function confirmWaypoint(place) {
	for (var i = 0; i < wayptsPrelim.length; i++)
	{
		waypts.push(wayptsPrelim[i]);	
	}
	wayptsPrelim = [];
	geocodeLatLng(geocoder, map, infoWindow, true);
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