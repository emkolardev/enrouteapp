//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// google maps api callback
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function initMap() {
	// set icon
	currentIcon = 'images/current.png';
	pinkIcon = 'images/pin-pink.png';
	
	// set style type names
	lightMapTypeId = 'lightstyle';
	darkMapTypeId = 'darkstyle';
	
	// set a default center: chicago; zoomed out to general midwest
	defaultCenter = new google.maps.LatLng({lat: 41.8369, lng: -87.6847});
	
	directionsService = new google.maps.DirectionsService();
	directionsDisplay = new google.maps.DirectionsRenderer({
		polylineOptions: {
			strokeColor: "#B85096",
			strokeWeight: 3
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
	
	directionsDisplay.setMap(map);

	// register stylers and set the initial map styles	
	setStyleTypes();
	map.setMapTypeId(lightMapTypeId);

	// init the infowindow to display in case of geolocation error
	infoWindow = new google.maps.InfoWindow();
	
	// try geolocation, center map, set marker
	setCurrentLocation();
	
	placeService = new google.maps.places.PlacesService(map);
	
	var input = document.getElementById('search-box');
	var placesBox = new google.maps.places.SearchBox(input);
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
	
	  map.addListener('bounds_changed', function() {
    placesBox.setBounds(map.getBounds());
  });

  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  placesBox.addListener('places_changed', function() {
    var places = placesBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      markers.push(new google.maps.Marker({
        map: map,
        icon: pinkIcon,
        title: place.name,
        position: place.geometry.location
      }));

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });


};


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// get current location, recenter
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function setCurrentLocation() {
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
// search the map
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function searchFor(q) {
	
	
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
	    }
	});
};
