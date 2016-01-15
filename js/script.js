//ui
var locArrow;

//map
var markers; 
var windows;
var map;
var geocoder;
var current;

// data
var destination;
var counter;
var steps;
var onRoute;
var onNav;
var steps; 
var navPoints;
var routeTime;
var addedTime;
var db;
var dirService;
var dirDisplay;
var placesService;
var tempWaypoint;
var waypoints;
var tempWaypoints;
var search;
var points;
var targets;
var targetBounds;
var defaultRadius;
var distanceAway;
var radiusAway;

//var addedTime;

(function() {
	db = sessionStorage;
	db.clear();
	onRoute = false;
	onNav = false;
	waypoints = [];
	tempWaypoints = [];
	steps = [];
	navPoints = [];
	counter = 0;
	steps = [];
	markers = [];
	windows = [];
	routeTime = 0;
	addedTime = 0;
	targets = [];
	destination = null;
	targetBounds = {
		north: 0,
		south: 0,
		east: 0,
		west: 0	
	};
	defaultRadius = '3218';
	distanceAway = '8045';
	radiusAway = '1609';
})();

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// map callback
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function initMap() {
	var defaultCenter = new google.maps.LatLng({lat: 41.8369, lng: -87.6847});
	
	map = new google.maps.Map(document.getElementById('map'), {
	center: defaultCenter,
			zoom: 11,
			disableDefaultUI: true
	});
	
	placesService = new google.maps.places.PlacesService(map);
	initPlaces('place-input', map);	
	geocoder = new google.maps.Geocoder;
	
	dirService = new google.maps.DirectionsService;
	dirDisplay = new google.maps.DirectionsRenderer;
	dirDisplay.setMap(map);

	setListeners(placesService);


	locArrow.classList.add('finding');
	geocodeCurrentLatLng(false, false);
	

	
}

function calcRoute(start, end, justDistance) {
	var request;
	if (tempWaypoints) {
		request = {
		    	origin: start,
				destination: end,
				waypoints: tempWaypoints,
				optimizeWaypoints: true,
				travelMode: google.maps.TravelMode.DRIVING
	  		};
	  		console.log(request);
	}
	else if (waypoints) {
			request = {
		    	origin: start,
				destination: end,
				waypoints: waypoints,
				optimizeWaypoints: true,
				travelMode: google.maps.TravelMode.DRIVING
	  		};	  
	  		console.log(request);	
	}
	else {
		request = {
	    	origin: start,
			destination: end,
			travelMode: google.maps.TravelMode.DRIVING
	  	};
	}
	if (justDistance) {
		calcRouteAddedTime(request, function(t) {
		 	var t2 = Math.round(t/60);
		 	if (t2 < 1) {
			 	t2 == '< 1';
		 	}
			document.getElementById('eta').innerHTML = 'Adds ' + t2 + ' min';
		});
	}
	else {
		clearMarkers();
	  	dirService.route(request, function(result, status) {
	    	if (status == google.maps.DirectionsStatus.OK) {
				dirDisplay.setDirections(result);
				console.log(result);
				updateSteps(result.routes[0].legs);
				if (waypoints) {
					makeWaypointIcons(result.routes[0].legs);
				}
				if (result.routes[0].legs.length > 0) {
					addTargets(result.routes[0].legs);
				}
				return result;
	    	}
	  	});
	}
}

function calcRouteAddedTime(request, p) {
	var time = 0;	
	dirService.route(request, function(result, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			console.log(result);
			for (var i = 0; i < result.routes[0].legs.length; i++) {
				time += result.routes[0].legs[i].duration.value;
			}
			console.log(time);
			addedTime = time - routeTime;
			if (p) {
				p(addedTime);
			}
		}
  	});
}


function setTargets(legs) {
	targets = [];
	for (var i = 0; i < legs.length; i++) {
		var distance = legs[i].distance.value;
		if (distance < 1069) {
			targets.push({
				lat: legs[i].start_location.lat(),
				lng: legs[i].start_location.lng()
			});
			console.log('added small target' + targets + ' on step ' + j);
		}
		else if (distance < 10690) {
			var halfway = legs[i].distance.value / 2;
			var dist = 0;
			for (var j = 0; j < legs[i].steps.length; j++) {
				dist += legs[i].steps[j].distance.value;
				if (dist >= halfway) {
					targets.push({
						lat: legs[i].steps[j].end_location.lat(),
						lng: legs[i].steps[j].end_location.lng()
					});
					console.log('added 10 target'+ targets + ' on step ' + j);
					break;
				}
			}
		}
		else if (distance < 106900) {
			var dist = 0;
			for (var j = 0; j < legs[i].steps.length; j++) {
				dist += legs[i].steps[j].distance.value;
				if (dist >= 10690) {
					targets.push({
						lat: legs[i].steps[j].end_location.lat(),
						lng: legs[i].steps[j].end_location.lng()
					});
					console.log('added 100 target' + targets + ' on step ' + j);
					dist = 0;
				}
			}
		}
		else {
			var dist = 0;
			for (var j = 0; j< legs[i].steps.length; j++) {
				dist += legs[i].steps[j].distance.value;
				if (dist >= 20000) {
					targets.push({
						lat: legs[i].steps[j].end_point.lat(),
						lng: legs[i].steps[j].end_point.lng()
					});
					console.log('added large target' + targets + ' on step ' + j);
					dist = 0;
				}
			}
		}
	}
	console.log('all targets: ', targets);
}

function enRoute(term, typeList) {
	console.log('finding this on route: ', term, typeList, targets);
	var request;
	var coords;
	targetBounds = {
		north: 0,
		south: 0,
		east: 0,
		west: 0
	};
	if (targets.length < 1) {
		return null;
	}
	clearMarkers();
	for (var i = 0; i < targets.length; i++) {
		coords = new google.maps.LatLng(targets[i].lat, targets[i].lng);
		if (typeList) {
			request = {
				location: coords,
				types: typeList,
				radius: radiusAway
			};
		}
		else {
			request = {
				location: coords,
				keyword: term,
				radius: radiusAway
			};
		}
		placesService.nearbySearch(request, findOnRoute);
	}
}



function addTargets(legs) {
	targets = [];
	var distance = 0;
	var lat1 = legs[0].steps[0].start_location.lat();
	var lng1 = legs[0].steps[0].start_location.lng();
	for (var i = 0; i < legs.length; i++) {
		distance += legs[i].distance.value;
	}
	for (var i = 0; i < legs.length; i++) {
		if (distance > 160000) {
			var gap = 20000;
			var dist = 0;
			for (var j = 0; j < legs[i].steps.length; j++) {
				for (var q = 1; q < legs[i].steps[j].path.length; q++) {
					var lat2 = legs[i].steps[j].path[q].lat();
					var lng2 = legs[i].steps[j].path[q].lng();
					dist = calcDistance(lat1, lat2, lng1, lng2);
					if (dist > gap) {
						targets.push({
							lat: lat2,
							lng: lng2
						});
						gap += 20000;
					}
				}
			}
		}
		else if (distance > 80000) {
			var gap = 10000;
			var dist = 0;
			for (var j = 0; j < legs[i].steps.length; j++) {
				for (var q = 1; q < legs[i].steps[j].path.length; q++) {
					var lat2 = legs[i].steps[j].path[q].lat();
					var lng2 = legs[i].steps[j].path[q].lng();
					dist = calcDistance(lat1, lat2, lng1, lng2);
					if (dist > gap) {
						targets.push({
							lat: lat2,
							lng: lng2
						});
						gap += 10000;
					}
				}
			}
		}
		else if (distance > 40000) {
			var gap = 8000;
			var dist = 0;
			for (var j = 0; j < legs[i].steps.length; j++) {
				for (var q = 1; q < legs[i].steps[j].path.length; q++) {
					var lat2 = legs[i].steps[j].path[q].lat();
					var lng2 = legs[i].steps[j].path[q].lng();
					dist = calcDistance(lat1, lat2, lng1, lng2);
					if (dist > gap) {
						targets.push({
							lat: lat2,
							lng: lng2
						});
						gap += 8000;
					}
				}
			}
		}
		else if (distance > 16000) {
			var gap = 4000;
			var dist = 0;
			for (var j = 0; j < legs[i].steps.length; j++) {
				for (var q = 1; q < legs[i].steps[j].path.length; q++) {
					var lat2 = legs[i].steps[j].path[q].lat();
					var lng2 = legs[i].steps[j].path[q].lng();
					dist = calcDistance(lat1, lat2, lng1, lng2);
					if (dist > gap) {
						targets.push({
							lat: lat2,
							lng: lng2
						});
						gap += 4000;
					}
				}
			}
		}
		else if (distance > 8000) {
			var gap = 2000;
			var dist = 0;
			for (var j = 0; j < legs[i].steps.length; j++) {
				for (var q = 1; q < legs[i].steps[j].path.length; q++) {
					var lat2 = legs[i].steps[j].path[q].lat();
					var lng2 = legs[i].steps[j].path[q].lng();
					dist = calcDistance(lat1, lat2, lng1, lng2);
					if (dist > gap) {
						targets.push({
							lat: lat2,
							lng: lng2
						});
						gap += 2000;
					}
				}
			}
		}
		else {
			var gap = 1609;
			var dist = 0;
			for (var j = 0; j < legs[i].steps.length; j++) {
				for (var q = 1; q < legs[i].steps[j].path.length; q++) {
					var lat2 = legs[i].steps[j].path[q].lat();
					var lng2 = legs[i].steps[j].path[q].lng();
					dist = calcDistance(lat1, lat2, lng1, lng2);
					if (dist > gap) {
						targets.push({
							lat: lat2,
							lng: lng2
						});
						gap += 1609;
					}
				}
			}
		}
	}
}

function findAlongRoute(results, status) {
	if (status != google.maps.places.PlacesServiceStatus.OK) {
		document.getElementById('place-input').value = 'Cannot find current location';
		return;
	}
	
	for (var i = 0; i < results.length; i++) {
		if (i > 20) {
			break;
		}
		var la = results[i].geometry.location.lat();
		var lo = results[i].geometry.location.lng();
		console.log('target lat lng: ', la, lo);
		if (targetBounds.south == 0) {
			targetBounds.south = la;
			console.log('setting south bound to ' + la);
		}
		else if (la < targetBounds.south) {
			targetBounds.south = la;
			console.log('setting south bound to ' + la);
		}
		if (targetBounds.north == 0) {
			targetBounds.north = la;
			console.log('setting north bound to ' + la);
		}
		else if (la > targetBounds.north) {
			targetBounds.north = la;
			console.log('setting north bound to ' + la);
		}
		if (targetBounds.east == 0) {
			targetBounds.east = lo;
			console.log('setting east bound to ' + lo);
		}
		else if (lo > targetBounds.east) {
			targetBounds.east = lo;
			console.log('setting east bound to ' + lo);
		}
		if (targetBounds.west == 0) {
			targetBounds.west = lo;
			console.log('setting west bound to ' + lo);
		}
		else if (lo < targetBounds.west) {
			targetBounds.west = lo;
			console.log('setting west bound to ' + lo);
		}
		
		console.log(results[i]);
		makeMarker(results[i]);

	}
	var ne = new google.maps.LatLng(targetBounds.north, targetBounds.east);
	var sw = new google.maps.LatLng(targetBounds.south, targetBounds.west);
	var bounds = new google.maps.LatLngBounds(sw, ne);
	map.fitBounds(bounds);	
}

function calcDistance(lat1, lat2, lng1, lng2) {
	var R = 6371000; // metres
	var φ1 = lat1 * Math.PI / 180;
	var φ2 = lat2 * Math.PI / 180;
	var Δφ = (lat2-lat1) * Math.PI / 180;
	var Δλ = (lng2-lng1) * Math.PI / 180;

	var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ/2) * Math.sin(Δλ/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	var d = R * c;
	
	return d;
}

function updateSteps(legs) {
	routeTime = 0;
	navPoints = [];
	steps = [];
	counter = 0;
	for (var i = 0; i < legs.length; i++) {
		routeTime += legs[i].duration.value;
		for (var j = 0; j < legs[i].steps.length; j++) {
			steps.push(legs[i].steps[j].instructions);
			navPoints.push({
				lat: legs[i].steps[j].start_location.lat(), 
				lng: legs[i].steps[j].start_location.lng()
			});
			if (i == legs.length - 1 && j == legs[i].steps.length - 1) {
				steps.push('(Destination)');
				navPoints.push({
					lat: legs[i].steps[j].end_location.lat(),
					lng: legs[i].steps[j].end_location.lng()
				});
			}
		}
	}
}

function makeWaypointIcons(legs) {
	var dock = document.getElementById('dock');
	while (dock.firstChild) {
		dock.removeChild(dock.firstChild);
	}
	var distances = [];
	var total = 0;
	for (var i = 0; i < legs.length; i++) {
		var bucket = document.createElement('div');
		bucket.classList.add('pointBucket');
		bucket.classList.add('flexItem');
		var point = document.createElement('span');
		point.classList.add('waypoint');
		if (i < legs.length - 1) {
			bucket.appendChild(point);
		}
		distances[i] = legs[i].distance.value;
		total += legs[i].distance.value;
		dock.appendChild(bucket);
	}
	console.log('distances found: ' + distances);
	//getFlexGrows(total, distances);	
	console.log('num of legs: ' + legs.length);
	console.log('distances: ' + distances);
	console.log('total distance: ' + total);
}

function getFlexGrows(total, distances) {
	var flexgrows = [];
	var percents = [];
	var unsorted = distances;
	distances.sort(function(a, b){return a-b});
	var min = distances[0];
	var base = ((min * 8) / total);
	console.log(min);
	for (var i = 0; i < unsorted.length; i++) {
		var fg = Math.round(((unsorted[i] * 8) / total) - base);
		if (fg < 1) {
			fg = 1;
		}
		else if (fg < 2) {
			fg = 2;
		}
		else if (fg < 3) {
			fg = 3;
		}
		else if (fg < 4) {
			fg = 4;
		}
		else if (fg < 5) {
			fg = 5;
		}
		else if (fg < 6) {
			fg = 6;
		}
		else if (fg < 7) {
			fg = 7;
		}
		else {
			fg = 8;
		}
		flexgrows[i] = fg;
	}	
	console.log(flexgrows);
	var buckets = document.getElementsByClassName('pointBucket');
	for (var i = 0; i < buckets.length; i++) {
		buckets[i].classList.add('x' + flexgrows[i]);
	}
}


function initPlaces(inputId) {
	var input = document.getElementById(inputId);
	search = new google.maps.places.SearchBox(input);
	map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
	
	map.addListener('bounds_changed', function() { 
		search.setBounds(map.getBounds());
	});
	
	markers = [];
	
	search.addListener('places_changed', function() {
		var icon;		
		var places = search.getPlaces();
		if (places.length == 0) {
			return;
		}
		
		if (!onRoute) {
			hideBar();
		}
		if (onRoute) {
			
			// TO DO: SHOW DISTANCE SLIDER OR SHAPE MAKER
				
		}
		
		//clear out old markers
		markers.forEach(function(marker) {
			marker.setMap(null);
		});
		markers = [];
			
		// for each place, get some info
		var bounds = new google.maps.LatLngBounds();
		places.forEach(function(place) {
		
			if (place.opening_hours && place.opening_hours.open_now) {
				icon = 'images/pin-green.png';
			}
			else {
				icon = 'images/pin-pink.png';
			}
			var marker = new google.maps.Marker({
				map: map,
				title: place.name,
				position: place.geometry.location,
				icon: icon,
				clickEvents: true
			});
			
			marker.addListener('click', function(event) {
				if (!onRoute) {
					showBar(false); // ui function
					displayPlace(place); // ui function
					toggleBtn(true);
				}
				else {
					tempWaypoints = [];
					console.log('waypoint?', place);
					confirmWaypoint(marker, place);
				}
			});
			
			markers.push(marker);
			
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
}

function currentLocation(p) {
	var infoWindow = new google.maps.InfoWindow();
	var currentPlace = {};
	// try geolocation
	if (navigator.geolocation) 
	{
		navigator.geolocation.getCurrentPosition(function(position) {
			var pos = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};
			map.setCenter(pos);
			if (p) {
				p(pos);
			}
		}, 
		function() { handleLocationError(true, infoWindow, map.getCenter()); });
	} 
	else 
	{
		// browser doesn't support Geolocation
		handleLocationError(false, infoWindow, map.getCenter());
	}
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// handle geolocation errors
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
  		'Error: The Geolocation service failed.' :
  		'Error: Your browser doesn\'t support geolocation.');
}


function confirmWaypoint(marker, place) {
	clearWindows();
	tempWaypoint = place;
	var openOrClosed = '';
	var openClass = 'noHours';
	if (place.opening_hours) {
		if (place.opening_hours.open_now) {
			openOrClosed = '(Open Now)';
			openClass = 'placeOpen';
		}
		else {
			openOrClosed = '(Closed Now)';
			openClass = 'placeClosed';
		}
	}
	var address = place.formatted_address || place.vicinity || 'No address data';
	var contentStr = 	'<div id="info-win">' +
						'<p><strong>' + 
						place.name + 
						'</strong> <span class="' +
						openClass +
						'">' +
						openOrClosed + 
						'</span><br />' +
						address +
						'</p><div class="dots" id="eta">' +
						'<span class="icon dotLoader dot1"></span><span class="icon dotLoader dot2"></span>' +
						'<span class="icon dotLoader dot3"></span>' +
						'</div>' +
						'<button class="addOrCancel add" id="add-waypoint">Add Waypoint</button>' +
						'<button class="addOrCancel cancel" id="cancel-waypoint">Cancel</button>' +
						'</div>';
	var infoWindow = new google.maps.InfoWindow({
		content: contentStr
	});
	windows.push(infoWindow);
	infoWindow.open(map, marker);
	geocodeCurrentLatLng(false, true);
	document.getElementById('add-waypoint').addEventListener('click', function() {
		waypoints.push(tempWaypoints[0]);
		console.log('added', waypoints);
		clearWindows();
		geocodeCurrentLatLng(true, false);
		
	});
	document.getElementById('cancel-waypoint').addEventListener('click', function() {
		console.log('cancel');
		clearWindows();
	});
}

function clearWindows() {
	for (var i = 0; i < windows.length; i++) {
		windows[i].close();
	}
	windows = [];
}




function setListeners(placesService) {
	var showOpenToggle = document.getElementById('only-open');
	var discoverBtn = document.getElementById('go-discover');
	var menuBtn = document.getElementById('menu-frame');
	var menuOpts = document.getElementById('menu-options');
	var discoverOpts = document.getElementById('discover-options');
	var menu = document.getElementById('slide-menu');
	var discCats = document.getElementsByClassName('iconDiscover');
	var navBtn = document.getElementById('nav-btn');
	var waypointBar = document.getElementById('waypoint-bar');
	var dock = document.getElementById('dock');
	var btmToolbar = document.getElementById('btm-toolbar');
	var placeInput = document.getElementById('place-input');
	var spinner = document.getElementById('spinner');
	var instructText = document.getElementById('instructions');
	var radiusPlus = document.getElementById('radius-plus');
	var radiusMinus = document.getElementById('radius-minus');
	var radiusVal = document.getElementById('radius-val');
	var mapOptionCheckboxes = document.getElementsByClassName('checkbox');
	var categories = ['cat-rest', 'cat-coffee', 'cat-food', 'cat-rec', 'cat-bars', 'cat-shop'];
	var queries = ['gas stations', 'coffee', 'restaurants', 'parks', 'bars', 'shopping'];
	
	var placeTypes = {
		food: ['bakery', 'cafe', 'food', 'restaurant'],
		rest_stops: ['gas_station'],
		recreation: ['amusement_park', 'aquarium', 'campground', 'museum', 'park', 'rv_park', 'zoo'],
		coffee: ['cafe', 'gas_station'],
		over_21: ['bar', 'casino', 'liquor_store', 'night_club'],
		shopping: ['book_store', 'clothing_store', 'department_store', 'electronics_store', 'furniture_store', 'home_goods_store', 'jewelry_store', 'pet_store', 'shoe_store', 'shopping_mall', 'store']
	};
	
	menuBtn.addEventListener('click', function() {
		toggleMenu();	
	});

	discoverBtn.addEventListener('click', function() {
		menuOpts.classList.remove('active');
		discoverOpts.classList.add('active');
	});

	/*
showOpenToggle.addEventListener('click', function() {
		onlyOpen(db.getItem('justOpen'));
		toggleMenu();
	});
*/
	
	locArrow = document.getElementById('icon-location');
	locArrow.addEventListener('click', function() {
		//animate the location arrow (thinking!)
		locArrow.classList.add('finding');
		//remove animation class after posiiton found
		geocodeCurrentLatLng(false, false, false, function(){ 
			locArrow.classList.remove('finding'); 
		});
	});
	
	radiusPlus.addEventListener('click', function() {
		var val = parseInt(radiusVal.innerHTML);
		if (val < 10) {
			val++;
			radiusVal.innerHTML = val;	
		}
	});
	
	radiusMinus.addEventListener('click', function() {
		var val = parseInt(radiusVal.innerHTML);
		if (val > 1) {
			val--;
			radiusVal.innerHTML = val;
		}
	});
	
	for (var i = 0; i < mapOptionCheckboxes.length; i++) {
		mapOptionCheckboxes[i].addEventListener('click', function() {
			this.classList.toggle('checked');
		});
	}
	
	for (var i = 0; i < discCats.length; i++) {
		discCats[i].addEventListener('click', function() {
			toggleMenu();
			if (!onRoute) {
				hideBar();
			}
			var searchTypes = placeTypes[this.id];
			console.log(searchTypes);
			if (!onRoute) {
				locArrow.classList.add('finding');
				var loc = currentLocation(function(pos) {
					locArrow.classList.remove('finding');
					var reqLoc = new google.maps.LatLng(pos.lat, pos.lng);
					var request = {
						location: reqLoc,
						types: searchTypes,
						radius: '1069'	
					};
					placesService.nearbySearch(request, discoverSearch);
				});
			}
			else {
				console.log('find on route??');
				enRoute(null, searchTypes);
					
			}
		});	
	}
	
	navBtn.addEventListener('click', function() {
		if (!onRoute) {
			instructText.innerHTML = '<span class="icon iconLoader spinner" id="spinner"></span>';
			geocodeCurrentLatLng(true, false, false);
			placeInput.value = '';
			placeInput.placeholder = 'Find near current route';
			onRoute = true;
		}
		else {
			displayInstructions();
		}
		
	});
}

function discoverSearch(results, status) {
	if (status != google.maps.places.PlacesServiceStatus.OK) {
		document.getElementById('place-input').value = 'Cannot find current location';
		return;
	}
	var bounds = new google.maps.LatLngBounds();
	clearMarkers();
	for (var i = 0; i < results.length; i++) {
		if (i > 20) {
			break;
		}
		console.log(results[i]);
		makeMarker(results[i]);
		currentLocation(function(pos) {
			var coords = new google.maps.LatLng(pos.lat, pos.lng);
			map.setCenter(coords);
			map.setZoom(13);
		});
	}
}


function findOnRoute(results, status) {
	if (status != google.maps.places.PlacesServiceStatus.OK) {
		document.getElementById('place-input').value = 'Cannot find current location';
		return;
	}
	
	for (var i = 0; i < results.length; i++) {
		if (i > 10) {
			break;
		}
		var la = results[i].geometry.location.lat();
		var lo = results[i].geometry.location.lng();
		console.log('target lat lng: ', la, lo);
		if (targetBounds.south == 0) {
			targetBounds.south = la;
			console.log('setting south bound to ' + la);
		}
		else if (la < targetBounds.south) {
			targetBounds.south = la;
			console.log('setting south bound to ' + la);
		}
		if (targetBounds.north == 0) {
			targetBounds.north = la;
			console.log('setting north bound to ' + la);
		}
		else if (la > targetBounds.north) {
			targetBounds.north = la;
			console.log('setting north bound to ' + la);
		}
		if (targetBounds.east == 0) {
			targetBounds.east = lo;
			console.log('setting east bound to ' + lo);
		}
		else if (lo > targetBounds.east) {
			targetBounds.east = lo;
			console.log('setting east bound to ' + lo);
		}
		if (targetBounds.west == 0) {
			targetBounds.west = lo;
			console.log('setting west bound to ' + lo);
		}
		else if (lo < targetBounds.west) {
			targetBounds.west = lo;
			console.log('setting west bound to ' + lo);
		}
		
		console.log(results[i]);
		makeMarker(results[i]);

	}
	var ne = new google.maps.LatLng(targetBounds.north, targetBounds.east);
	var sw = new google.maps.LatLng(targetBounds.south, targetBounds.west);
	var bounds = new google.maps.LatLngBounds(sw, ne);
	map.fitBounds(bounds);	
}


function makeMarker(place) {
	console.log('creating?');
	var icon;
	if (place.opening_hours && place.opening_hours.open_now) {
		icon = 'images/pin-green.png';
	}
	else {
		icon = 'images/pin-pink.png';
	}
	var latLng = new google.maps.LatLng({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
	console.log(latLng.lat(), latLng.lng());
	var marker = new google.maps.Marker({
		position: latLng,
		title: place.name,
		icon: icon
	});
	marker.setMap(map);
	marker.addListener('click', function() {
		if (!onRoute) {
			showBar(false); // ui function
			displayPlace(place); // ui function
			toggleBtn(true);
		}
		else {
			tempWaypoints = [];
			console.log('waypoint?', place);
			confirmWaypoint(marker, place);
		}
	});
	markers.push(marker);
}

function clearMarkers() {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	markers = [];
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// reverse geocoding
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function geocodeCurrentLatLng(nav, eta, fn) {
	var latlng = {lat: 0, lng: 0};
	currentLocation(function(p) { 
		latlng = {lat: p.lat, lng: p.lng};
		geocoder.geocode({'location': latlng}, function(results, status) {
			if (status === google.maps.GeocoderStatus.OK) {
				if (results[0]) {
					map.setZoom(13);
					if (current) {
						current.setMap(null);
			        }
			        current = new google.maps.Marker({
			          position: latlng,
			          map: map,
			          title: 'You',
			          icon: 'images/current.png'
			        });
			        var center = new google.maps.LatLng(p.lat, p.lng);
			        current.addListener('click', function() {
				        if (!onRoute) {
							showBar(false);
							displayPlace({name: 'Current Location', formatted_address: results[0].formatted_address});
							toggleBtn(false);
						}
						else {
							console.log('waypoint?', place);
						}
			        });
			        if (!nav && !eta && !fn) {
				    	map.setCenter(center);

			        }
					if (nav) {
						var pos = new google.maps.LatLng(latlng);
						var dest = new google.maps.LatLng({
							lat: destination.geometry.location.lat(), 
							lng: destination.geometry.location.lng()
						});
						calcRoute(pos, dest, false);
						document.getElementById('btm-toolbar').classList.add('expand');
						document.getElementById('waypoint-bar').classList.add('open');
						document.getElementById('dock').classList.add('expand');
						document.getElementById('nav-btn').innerHTML = 'Start';
						document.getElementById('instructions').innerHTML = '<p class="btmBarText">Begin navigation?</p>';
						return;
					}
					if (eta) {
						var address;
						var pos = new google.maps.LatLng(latlng);
						var dest = new google.maps.LatLng({
							lat: destination.geometry.location.lat(),
							lng: destination.geometry.location.lng()
						});
						if (tempWaypoint) {
							if (tempWaypoint.formatted_address) {
								address = tempWaypoint.formatted_address;
							}
							else if (tempWaypoint.vicinity) {
								address = tempWaypoint.vicinity;
							}
							else {
								address = tempWaypoint.name;
							}
							tempWaypoints[0] = {location: address, stopover: true};
						}
						for (var i = 0; i < waypoints.length; i++) {
							tempWaypoints[i+1] = waypoints[i];
						}
						calcRoute(pos, dest, true);
					}
					if (fn) {
						fn();
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
  		locArrow.classList.remove('finding');
	});
};

function geocodeLatLng(lat, lng) {
	var latlng = {lat: lat, lng: lng};
	geocoder.geocode({'location': latlng}, function(results, status) {
		if (status === google.maps.GeocoderStatus.OK) {
			if (results[0]) {
				return results[0]; 	
			}
		}
	});
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// UI 
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function showBar(expand) {
	var bar = document.getElementById('btm-toolbar');
	bar.classList.add('open');
	if (expand) {
		var ptBar = document.getElementById('waypoint-bar');
		var dock = document.getElementById('dock');
		bar.classList.add('expand');
		ptBar.classList.add('open');
		dock.classList.add('expand');
		dock.classList.add('twelve');
		dock.classList.add('columns');

	}
}

function hideBar() {
	var bar = document.getElementById('btm-toolbar');
	var ptBar = document.getElementById('waypoint-bar');
	var dock = document.getElementById('dock');
	dock.classList.remove('twelve');
	dock.classList.remove('columns');
	ptBar.classList.remove('open');
	bar.classList.remove('expand');
	bar.classList.remove('open');
}

function toggleBtn(show) {
	if (show) {
		document.getElementById('nav-btn').classList.add('show');
		return;
	}
	document.getElementById('nav-btn').classList.remove('show');
}

function displayInstructions() {
	if (counter == 0) {
		document.getElementById('nav-btn').innerHTML = 'Next';
	}
	var text = steps[counter];
	var htmlStr = 	'<p class="btmBarText">' +
				text +
				'</p>';
	document.getElementById('instructions').innerHTML = htmlStr;
	var center = new google.maps.LatLng(navPoints[counter].lat, navPoints[counter].lng);
	map.setCenter(center);
	map.setZoom(18);
	counter++;
	if (counter >= steps.length) {
		counter = 0;
		onRoute = false;
	}
	
}

function displayPlace(place) {
	var address;
	if (place.formatted_address) {
		address = place.formatted_address;
		document.getElementById('place-input').value = place.name + ' ' + place.formatted_address;
	}
	else if (place.vicinity) {
		address = place.vicinity;
		document.getElementById('place-input').value = place.name + ' ' + place.vicinity;
	}
	else {
		address = 'No address data';
		document.getElementById('place-input').value = place.name;
	}
	if (place.name != 'Current Location') {
		heading = 'Get Directions To:';	
		destination = place; 
	}
	else {
		heading = ' ';
		place.name = 'Current Location:';
	}
	
	var instruct = document.getElementById('instructions');
	var str = 	'<p class="btmBarText"><span class="heading">' +
				heading +
				'</span><br />' + 
				place.name +
				' <span id="open-closed"></span><br />' +
				address +
				'<br /><span id="eta" class="routeTime"></span></p>';
	instruct.innerHTML = str;
	
	if (place.opening_hours) {
		var showWhetherOpen = document.getElementById('open-closed');
		if (place.opening_hours.open_now) {
			showWhetherOpen.innerHTML = '(Open Now)';
			showWhetherOpen.classList.add('openNow');
		}
		else {
			showWhetherOpen.innerHTML = '(Closed Now)';
			showWhetherOpen.classList.add('closedNow');
		}
	}
	
	geocodeCurrentLatLng(false, true);
}
			

function onlyOpen(val) {
	if (val == 'false' || val == null) {
		db.setItem('justOpen', 'true');
		console.log('false, switching to true');
	}
	else if (val == 'true') {
		db.setItem('justOpen', false);
		console.log('true, switching to false');
	}
	else {
		console.log('huh?');
	}
}


function toggleMenu() {
	var menu = document.getElementById('slide-menu');
	var menuOpts = document.getElementById('menu-options');
	var discoverOpts = document.getElementById('discover-options');
	
	menu.classList.toggle('open');
	
	if ((!menuOpts.classList.contains('active')) && (!discoverOpts.classList.contains('active'))) {
		setTimeout(function() {
			menuOpts.classList.add('active')
		}, 200);
	}
	else {
		menuOpts.classList.remove('active');
		discoverOpts.classList.remove('active');
	}
}