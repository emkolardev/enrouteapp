//ui
var locArrow;
//map
var markers; 
var map;
var db = sessionStorage;

(function() {
	db.clear();
})();

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// map callback
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function initMap() {
	var placesService;
	var defaultCenter = new google.maps.LatLng({lat: 41.8369, lng: -87.6847});
	
	map = new google.maps.Map(document.getElementById('map'), {
	center: defaultCenter,
			zoom: 11,
			disableDefaultUI: true
	});
	
	placeService = new google.maps.places.PlacesService(map);
	initPlaces('place-input', map);	
	
	
	setListeners(placeService);

	currentLocation(function(){ 
			locArrow.classList.remove('finding'); 
	});
	
}


function initPlaces(inputId) {
	var input = document.getElementById(inputId);
	var search = new google.maps.places.SearchBox(input);
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
		
		hideBar();
		
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
			
			marker.addListener('click', function() {
				showBar(false); // ui function
				displayPlace(place); // ui function
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
	// try geolocation
	if (navigator.geolocation) 
	{
		navigator.geolocation.getCurrentPosition(function(position) {
			var pos = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};
			map.setCenter(pos);
			var marker = new google.maps.Marker({
				position: pos,
				map: map,
				title: 'Your Location',
				icon: 'images/current.png',
				clickEvents: true
			});		
			marker.addListener('click', function() {
				
			});
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





function setListeners(ps) {
	var showOpenToggle = document.getElementById('only-open');
	var discoverBtn = document.getElementById('go-discover');
	var menuBtn = document.getElementById('menu-frame');
	var menuOpts = document.getElementById('menu-options');
	var discoverOpts = document.getElementById('discover-options');
	var menu = document.getElementById('slide-menu');
	var categories = ['cat-rest', 'cat-coffee', 'cat-food', 'cat-rec', 'cat-bars', 'cat-shop'];
	var queries = ['gas stations', 'coffee', 'restaurants', 'parks', 'bars', 'shopping'];
	
	var discCats = document.getElementsByClassName('iconDiscover');
	
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

	showOpenToggle.addEventListener('click', function() {
		onlyOpen(db.getItem('justOpen'));
		toggleMenu();
	});
	
	locArrow = document.getElementById('icon-location');
	locArrow.addEventListener('click', function() {
		//animate the location arrow (thinking!)
		locArrow.classList.add('finding');
		//remove animation class after posiiton found
		currentLocation(function(){ 
			locArrow.classList.remove('finding'); 
		});
	});
	
	for (var i = 0; i < discCats.length; i++) {
		discCats[i].addEventListener('click', function() {
			toggleMenu();
			hideBar();
			var searchTypes = placeTypes[this.id];
			console.log(searchTypes);
			locArrow.classList.add('finding');
			var loc = currentLocation(function(pos) {
				locArrow.classList.remove('finding');
				var reqLoc = new google.maps.LatLng(pos.lat, pos.lng);
				var request = {
					location: reqLoc,
					radius: '1609',
					types: searchTypes	
				};
				
				ps.nearbySearch(request, discoverSearch);
				
			});
			
		});	
	}
}

function discoverSearch(results, status) {
	if (!status == google.maps.places.PlacesServiceStatus.OK) {
		return;
	}
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	for (var i = 0; i < results.length; i++) {
		if (i > 20) {
			break;
		}
		console.log(results[i]);
		makeMarker(results[i]);
	}
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
		showBar(false); // ui function
		displayPlace(place); // ui function
	});
	markers.push(marker);
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

function displayPlace(place) {
	console.log(place);
	var address;
	if (place.formatted_address) {
		address = place.formatted_address;
	}
	else if (place.vicinity) {
		address = place.vicinity;
	}
	else {
		address = "No address data";
	}
	
	var instruct = document.getElementById('instructions');
	var str = 	'<p class="btmBarText"><span class="heading">Get Directions To:</span><br />' + 
				place.name +
				' <span id="open-closed"></span><br />' +
				address +
				'</p>';
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