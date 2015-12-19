// ui
var locIcon;
var menuIcon;
var sideMenu;
var toggleMapStyle;
var searchBox;
var searchForm;
var getDirect;
var footer;
var waypointDock;
var dockStart; 
var instruct;
var waypointPath;
var directIcon;

(function() {
	'use strict';
	
	// init elements
	locIcon = document.getElementById('loc-icon');
	menuIcon = document.getElementById('menu-icon');
	sideMenu = document.getElementById('side-menu');
	//styleBtn = document.getElementById('style-button');
	searchBox = document.getElementById('search-box');
	searchForm = document.getElementById('search-form');
	getDirect = document.getElementById('get-directions');
	footer = document.getElementById('footer-bar');
	waypointDock = document.getElementById('waypoint-dock');
	dockStart = document.getElementById('dock-start');
	instruct = document.getElementById('instruct');
	waypointPath = document.getElementById('path-icon');
	directIcon = document.getElementById('direction-icon');
	
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
	
	getDirect.addEventListener('click', function() {
		geocodeLatLng(geocoder, map, infoWindow, true);
		setTimeout(function() {
			footer.classList.add('expanded');
			waypointDock.classList.add('expanded');
			getDirect.classList.add('docked');
			dockStart.classList.add('expanded');
			waypointPath.classList.add('expanded');
			searchBox.placeholder = "Find near route...";
			directIcon.classList.add('show');
			showInstruct();
		}, 1200);
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
	instruct.innerHTML = 'Head <strong>WEST</strong> on<br />' +
		'<span style="font-size: 18px">Boulevards Street</span>';
}