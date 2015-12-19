function setStyleTypes() {
	var darkPoly = '#D31DFF';

	var lightMapType = new google.maps.StyledMapType([
	    {
	      "featureType":"landscape",
	      "stylers": [
	        {"hue":"#FFBB00"},{"saturation":43.400000000000006},{"lightness":37.599999999999994},{"gamma":1}
	      ]
	    },
	    {
	      "featureType":"road.highway",
	      "stylers": [
	        {"hue":"#FFC200"},
	        {"saturation":-61.8},
	        {"lightness":45.599999999999994},
	        {"gamma":1}
	      ]
	    },
	    {
	      "featureType":"road.arterial",
	      "stylers": [
	        {"hue":"#FF0300"},
	        {"saturation":-100},
	        {"lightness":51.19999999999999},
	        {"gamma":1}
	      ]
	    },
	    {
	      "featureType":"road.local",
	      "stylers": [
	        {"hue":"#FF0300"},
	        {"saturation":-100},
	        {"lightness":52},
	        {"gamma":1}
	      ]
	    },
	    {
	      "featureType":"water",
	      "stylers": [
	        {"hue":"#0078FF"},
	        {"saturation":-13.200000000000003},
	        {"lightness":2.4000000000000057},
	        {"gamma":1}
	      ]
	    },
	    {
	      "featureType":"poi",
	      "stylers": [
	        {"hue":"#00FF6A"},
	        {"saturation":-1.0989010989011234},
	        {"lightness":11.200000000000017},
	        {"gamma":1}
	      ]
	    },
	    {
		    "name": "lightstyle"
	    }
	  ]);
	
	var darkMapType = new google.maps.StyledMapType([
	    {
	      "featureType":"all","elementType":"labels.text.fill",
	      "stylers": [
	        {"saturation":36},
	        {"color":"#000000"},
	        {"lightness":40}
	      ]
	    },
	    {
	      "featureType":"all",
	      "elementType":"labels.text.stroke",
	      "stylers": [
	        {"visibility":"on"},
	        {"color":"#000000"},
	        {"lightness":16}
	      ]
	    },
	    {
	      "featureType":"all",
	      "elementType":"labels.icon",
	      "stylers": [
	        {"visibility":"off"}
	      ]
	    },
	    {
	      "featureType":"administrative",
	      "elementType":"geometry.fill",
	      "stylers": [
	        {"color":"#000000"},
	        {"lightness":20}
	      ]
	    },
	    {
	      "featureType":"administrative",
	      "elementType":"geometry.stroke",
	      "stylers": [
	        {"color":"#000000"},
	        {"lightness":17},
	        {"weight":1.2}
	      ]
	    },
	    {
	      "featureType":"landscape",
	      "elementType":"geometry",
	      "stylers": [
	        {"color":"#000000"},
	        {"lightness":20}
	      ]
	    },
	    {
	      "featureType":"poi",
	      "elementType":"geometry",
	      "stylers": [
	        {"color":"#000000"},
	        {"lightness": 21}
	      ]
	    },
	    {
	      "featureType":"road.highway",
	      "elementType":"geometry",
	      "stylers": [
	        {"color":"#000000"},
	        {"lightness": 33},
	        {"weight": 0.4}
	      ]
	    },
	    {
	      "featureType":"road.arterial",
	      "elementType":"geometry",
	      "stylers": [
	        {"color":"#000000"},
	        {"weight": 0.3},
	        {"lightness": 28}
	      ]
	    },
	    {
	      "featureType":"road.local",
	      "elementType":"geometry",
	      "stylers": [
	        {"color":"#000000"},
	        {"lightness":25},
	        {"weight": 0.5}
	      ]
	    },
	    {
	      "featureType":"transit",
	      "elementType":"geometry",
	      "stylers": [
	        {"color":"#000000"},
	        {"lightness":19}
	      ]
	    },
	    {
	      "featureType":"water",
	      "elementType":"geometry",
	      "stylers": [
	        {"color":"#000000"},
	        {"lightness":17}
	      ]
	    },
	    {
		    "name": "darkstyle"
	    }
	  ]);

	map.mapTypes.set(lightMapTypeId, lightMapType);
	map.mapTypes.set(darkMapTypeId, darkMapType);
};