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