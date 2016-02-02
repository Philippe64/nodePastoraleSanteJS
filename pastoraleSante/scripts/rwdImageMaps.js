	
	/*
	* cia-it.com
	* This script is a fork in pure vanilla JS  of:
	* rwdImageMaps jQuery plugin v1.5
	*
	* Allows image maps to be used in a responsive design by recalculating the area coordinates to match the actual image size on load and window.resize
	*
	* Copyright (c) 2013 Matt Stow
	* https://github.com/stowball/jQuery-rwdImageMaps
	* http://mattstow.com
	* Licensed under the MIT license
	
	*/
	// save original area coords
	var oMapArea = {};
	
	// update all image map coords 
	var rwdImageMaps = function(event) {
		// build an array of img elements
		var $images = [].slice.call(document.getElementsByTagName("img"));
		
		// for each image  with usemap attribute
		(function() {
			$images.map(function(elem) {
				if (!!elem.getAttribute('usemap')){
					// calculate ratio between defined widht/ hight and real width/height
					var wPercent = elem.clientWidth/100;
					var	hPercent = elem.clientHeight/100;
					var w = elem.naturalWidth;
					var h = elem.naturalHeight;
					
					// build an array of area elements 
					// get name of map element
					var mapName = elem.getAttribute("usemap").replace("#", "");
					var mapElem = document.getElementsByName(mapName)[0];
					
					if (!oMapArea[mapName]){
							oMapArea[mapName]= [];
					}
					var mapAreas = [].slice.call(mapElem.getElementsByTagName("area"));	
					
					mapAreas.map(function(mapArea, indexArea) {
						//build an array of coords		
					
						if(!oMapArea[mapName][indexArea]){
									oMapArea[mapName][indexArea]=mapArea.getAttribute("coords");
						}
								
						var coords = oMapArea[mapName][indexArea].split(",");
						
						// recalculate coords
						for (var i = 0; i < coords.length; ++i) {
							if (i % 2 === 0)
								coords[i] = parseInt(((coords[i]/w)*100)*wPercent).toString();
							else
								coords[i] = parseInt(((coords[i]/h)*100)*hPercent).toString();
						}
						//
						mapArea.setAttribute("coords", coords.toString());
					});
				}
			});		
		})() // end of include function  rwdImageMap
		
	};  // end of function rwdImageMaps
	// even Listener
	window.addEventListener('load', rwdImageMaps, false);
	window.addEventListener('resize',rwdImageMaps, false);
		
	