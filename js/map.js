/**
 * Map initialization
 */
function mapInit() {
	
  

  // Map Options
	var myOptions = {
		zoom: mapCenterZoom.zoom,
		center: new google.maps.LatLng(mapCenterZoom.lat, mapCenterZoom.lng),
		mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      mapTypeIds: [
                   "Map",
                    google.maps.MapTypeId.SATELLITE,
                    google.maps.MapTypeId.HYBRID
                    ],
      position: google.maps.ControlPosition.RIGHT_TOP
    },
		streetViewControl: false,
		maxZoom: 17,
		minZoom: 9
	};
	
	map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
  
  // style the base map
  styleMap();
    
    // legend
    var legendDiv = document.getElementById('legend');
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(legendDiv);
	
	
  
	// Add layer
	layer = new google.maps.FusionTablesLayer({ query: { select: 'geometry', from: tableID }, map: map });
    
	
	//add a click listener to the layer
	google.maps.event.addListener(layer, 'click', function(e) {
		//update the content of the InfoWindow
		e.infoWindowHtml = '<div class="googft-info-window">';
        e.infoWindowHtml += '<h3>Neighborhood ' + e.row['ID'].value + "</h3>";
        e.infoWindowHtml += '<strong>' + $("#mapIndicie option:selected").html() + '</strong><br />';
		theID = $("#mapIndicie option:selected").val();
        e.infoWindowHtml += 'Score: ' + e.row[$("#mapIndicie option:selected").val()].value + FTmeta[theID].style.units + '<br />';
		e.infoWindowHtml += 'County Average: ' + countyAverage[theID] + FTmeta[theID].style.units + '<br />';
		e.infoWindowHtml += '<p><a href="javascript:void(0)" onclick="selectNeighborhoodByID(' + e.row['ID'].value + ')">Select Neighborhood</a></p>';
		e.infoWindowHtml += "</div>";
	});
	
	styleFusionTable(FTmeta[$("#mapIndicie option:selected").val()]);
    
    // Hack for fusion tables tiles not loading
	setTimeout(function(){
		$("img[src*='mapslt']").each(function(){
			$(this).attr("src",$(this).attr("src")+"&"+(new Date()).getTime());
		});
	}, 2000);
    
    // do something only the first time the map is loaded, in this case legend
    google.maps.event.addListenerOnce(map, 'idle', function(){
        $("#legend").css("z-index", "100");
    });
}


/**
 * Add markers (vector) to the map.
 * Also removes popups and selects added feature.
 * @param {float} long
 * @param {float} lat
 * @param {featuretype} the type of feature/marker (0=address,1=facility,2=identify)
 * @param {label} the content to put in the popup
 */
function addMarker(lon, lat, featuretype, label) {
	// remove old marker
     if (marker != null) marker.setMap(null);

     // add new marker
     marker = new google.maps.Marker({
          position: new google.maps.LatLng(lat, lon),
          map: map,
          //title:"Hello World!",
          animation: google.maps.Animation.DROP,
          flat: false
          //icon: "img/sozialeeinrichtung.png"
     });
     
     // Create info window
     var mycontent = label;
     var infowindow = new google.maps.InfoWindow({ content: mycontent });
     google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(map,marker);
     });
     
    // zoom to marker
	map.setCenter(new google.maps.LatLng(lat, lon));
	map.setZoom(13);
	
}


/**
 * Retrieve Data via intersect
 */
function performIntersection(lat, lon) {
	// Perform intersect
	url = "https://www.google.com/fusiontables/api/query/?sql=SELECT ID," + getFieldsArray(FTmeta).join() + " FROM " + tableID + " WHERE ST_INTERSECTS(geometry, CIRCLE(LATLNG(" + lat + "," + lon + "),1))&jsonCallback=?";
	$.getJSON(url, function(data) {
		if (data.table.rows.length > 0) {
			assignData(data.table);
			updateData(FTmeta[$("#mapIndicie option:selected").val()]);
			styleFusionTable(FTmeta[$("#mapIndicie option:selected").val()]);
      addMarker(lon, lat, 0, "<h3>Neighborhood " + activeRecord.ID + "</h3>");
		}
		else {
			//console.log("Unable to communicate with Fusion Tables.");
		}
	});
}


/**
 * Retrieve Data via id
 */
function selectNeighborhoodByID(idvalue) {
    // Get neighborhood data
    url = "https://www.google.com/fusiontables/api/query/?sql=SELECT ID," + getFieldsArray(FTmeta).join() + " FROM " + tableID + " WHERE ID = " + idvalue + "&jsonCallback=?";
    $.getJSON(url, function(data) {
        if (data.table.rows.length > 0) {
            assignData(data.table);
            window.location.hash = $("#mapIndicie").val() + "/" + idvalue;
            updateData(FTmeta[$("#mapIndicie option:selected").val()]);
            styleFusionTable(FTmeta[$("#mapIndicie option:selected").val()]);
        }
        else {
            //console.log("Unable to communicate with Fusion Tables.");
        }
    });
    
    // add marker to the neighborhood
    // bit of cheating here - using local service for polygon centroid
    url = wsbase + 'v1/ws_geo_getcentroid.php?geotable=neighborhoods&callback=?&format=json&srid=4326&forceonsurface=true&parameters=id=' + idvalue;
    $.getJSON(url, function(data) {
        if (data.total_rows > 0) {
            // if not adding marker
            map.setCenter(new google.maps.LatLng(data.rows[0].row.y, data.rows[0].row.x));
            map.setZoom(13);

            //$.each(data.rows, function(i, item){
                //addMarker(item.row.x, item.row.y, 0, "<h3>Neighborhood " + idvalue + "</h3>");
            //});
        }
    });


    
}



/**
 * Fusion tables layer styling
 */
function styleFusionTable(measure) {

    theOpacity = $("#opacity_slider").slider("value") / 100;
    var mapStyleJSON =  [];
    
    // Highlight selected neighborhood
    if ( !jQuery.isEmptyObject(activeRecord) ) {
      mapStyleJSON.push({ where: " ID = " + activeRecord.ID , polygonOptions: { strokeColor: '#3366CC', strokeWeight: 8, zOrder : 2 } });
    }

    if (measure.style.type == "range") {
        $.each(measure.style.breaks, function(index, value) {
            if (index == measure.style.breaks.length - 1) {
                mapStyleJSON.push( { where: measure.field + " > " + value, polygonOptions: { fillColor: measure.style.colors[index], fillOpacity: theOpacity } });
            }
            else if (index === 0) {
                mapStyleJSON.push( { where: measure.field + " >= 0 and " + measure.field + " <= " + measure.style.breaks[index + 1], polygonOptions: { fillColor: measure.style.colors[index], fillOpacity: theOpacity } });
            }
            else {
                mapStyleJSON.push({ where: measure.field + " > " + value + " and " + measure.field + " <= " + measure.style.breaks[index + 1], polygonOptions: { fillColor: measure.style.colors[index], fillOpacity: theOpacity } });
            }
        });
    }

   
 
    layer.setOptions({ styles: mapStyleJSON });
    
    // Legend
    createLegend(measure);
    
}


/**
 * Functions to create legend
 */
// Legend
function createLegend(measure) {
    
    theOpacity = $("#opacity_slider").slider("value") / 100;
    theOpacity = theOpacity + 0.2; // make up for white legend background
    
    // empty div
    $("#legend").empty();
    $("#legend").show();
    
    if (measure.style.type == "range") {
        $.each(measure.style.breaks, function(index, value) {
            if (index == measure.style.breaks.length - 1) {
                $("#legend").append('<div><span style="background-color: ' + measure.style.colors[index] + '; opacity: ' + theOpacity + '"></span>> ' + value + measure.style.units + '</div>');
            }
            else {
                $("#legend").append('<div><span style="background-color: ' + measure.style.colors[index] + '; opacity: ' + theOpacity + '"></span>' + value + ' - ' + measure.style.breaks[index + 1] + measure.style.units + '</div>');
            }
        });
    }
    else if (measure.style.type == "value") {
        
    }
    
}


/**
 * Subtle Google Maps Style
 */
// Styled Map
function styleMap() {
   
    var style = [
        {
          featureType: "road",
          elementType: "labels",
          stylers: [
            { saturation: -100 },
            { lightness: 70 },
            { gamma: 0.4 }
          ]
        },{
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [
            { saturation: -100 },
            { lightness: 40 }
          ]
        },{
          featureType: "road.arterial",
          elementType: "geometry",
          stylers: [
            { saturation: -100 },
            { lightness: 70 },
            { gamma: 0.4 },
            { visibility: "simplified" }
          ]
        },{
          featureType: "road.local",
          elementType: "geometry",
          stylers: [
            { saturation: -100 },
            { lightness: 20 },
            { gamma: 0.8 },
            { visibility: "simplified" }
          ]
        },{
          featureType: "administrative",
          elementType: "labels",
          stylers: [
            { visibility: "off" }
          ]
        },{
          featureType: "landscape",
          elementType: "labels",
          stylers: [
            { lightness: -2 }
          ]
        },{
          featureType: "poi",
          elementType: "all",
          stylers: [
            { saturation: -75 }
          ]
        },{
          featureType: "water",
          elementType: "labels",
          stylers: [
            { lightness: -2 }
          ]
        },{
    featureType: "water",
    elementType: "all",
    stylers: [
      { saturation: -100 }
    ]
  },{
          featureType: "transit",
          elementType: "all",
          stylers: [
            { visibility: "off" }
          ]
        }
    ];

    var styledMapType = new google.maps.StyledMapType(style, {
        map: map,
        name: 'Map'
    });
   map.mapTypes.set('Map', styledMapType);
  map.setMapTypeId('Map');
}
