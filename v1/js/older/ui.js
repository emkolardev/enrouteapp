(function() {
	'use strict';
	
	// init elements
	getLocIcon = document.getElementById('get-loc-icon');
	toggleMenu = document.getElementById('toggle-menu');
	sideMenu = document.getElementById('side-menu');
	toggleMapStyle = document.getElementById('toggle-map-style');
	searchBox = document.getElementById('search-box');
	searchForm = document.getElementById('search-form');
	
	// add event listeners
	getLocIcon.addEventListener('click', function() {
		//animate the location arrow
		getLocIcon.classList.add('find');
		//remove animation class after 1s
		setTimeout(function(){ 
			getLocIcon.classList.remove('find'); 
		}, 1000);
		setCurrentLocation();
	});
	
	toggleMenu.addEventListener('click', function() {
		sideMenu.classList.toggle('open');
	});
	
	toggleMapStyle.addEventListener('click', function() {
		if (toggleMapStyle.classList.contains('goNight')) {
			changeStyles('night');
		}
		else {
			changeStyles('day');
		}
		toggleMapStyle.classList.toggle('goNight');
		toggleMapStyle.classList.toggle('goDay');
		sideMenu.classList.toggle('open');
	});
	
	searchForm.addEventListener('submit', function(event) {
		event.preventDefault();
	});
	
/*
	searchBox.addEventListener('keyup', function(event){
		if (event.keyCode == 13)
		{
			//searchFor(searchBox.value);)
			calcRoute();
		}
	});
*/
	
})();