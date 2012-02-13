/**
 * Map initialization
 */ 
function mapInit() {
	
	var myOptions = {
		zoom: mapCenterZoom.zoom,
		center: new google.maps.LatLng(mapCenterZoom.lat, mapCenterZoom.lng),
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControl: false,
		streetViewControl: false,
		maxZoom: 17,
		minZoom: 9
	};
	
	map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
    
    // add legend div
    var legendDiv = document.getElementById('legend');
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(legendDiv);
	
	// style the base map
	styleMap();
  
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
     });
     
     // Create info window
     var mycontent = label; 
     var infowindow = new google.maps.InfoWindow({ content: mycontent });
     google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(map,marker);
     });
     
    // zoom to marker
	//map.setCenter(new google.maps.LatLng(lat, lon));
	//map.setZoom(14);
	
	// Intersection
	performIntersection(lat, lon);
	
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
		}
		else {
			console.log("Unable to communicate with Fusion Tables.");
		}
	});	
}


/**
 * Retrieve Data via id
 */
function selectNeighborhoodByID(idvalue) {
	url = "https://www.google.com/fusiontables/api/query/?sql=SELECT ID," + getFieldsArray(FTmeta).join() + " FROM " + tableID + " WHERE ID = " + idvalue + "&jsonCallback=?";
	$.getJSON(url, function(data) {					  						 
		if (data.table.rows.length > 0) {
			assignData(data.table);
			updateData(FTmeta[$("#mapIndicie option:selected").val()]);
			styleFusionTable(FTmeta[$("#mapIndicie option:selected").val()]);
		}
		else {
			console.log("Unable to communicate with Fusion Tables.");
		}
	});	
}



/**
 * Fusion tables layer styling
 */
function styleFusionTable(measure) {    
    
    // highlight neighborhood if selected    
    neighborhood = (activeRecord.ID) ? activeRecord.ID : 0;
    var mapStyleJSON =  [];
    
    if (measure.style.type == "range") {
        $.each(measure.style.breaks, function(index, value) {            
            if (index == measure.style.breaks.length - 1) {              
                mapStyleJSON.push( { where: measure.field + " > " + value, polygonOptions: { fillColor: measure.style.colors[index], fillOpacity: 1 } });
            }
            else if (index == 0) {
                mapStyleJSON.push( { where: measure.field + " <= " + measure.style.breaks[index + 1], polygonOptions: { fillColor: measure.style.colors[index], fillOpacity: 1 } });
            }
            else {
                mapStyleJSON.push({ where: measure.field + " > " + value + " and " + measure.field + " <= " + measure.style.breaks[index + 1], polygonOptions: { fillColor: measure.style.colors[index], fillOpacity: 1 } });
            }
        });
        
    }
    else if (measure.style.type == "value") {
        
    }
    
    mapStyleJSON.push( { where: "ID = " + neighborhood, polygonOptions: { strokeColor: "#rrggbb", strokeWeight: 6 }});
    
    layer.setOptions({ styles: mapStyleJSON });
    
    // Legend
	createLegend(measure);
    
}


/**
 * Functions to create legend
 */
// Legend
function createLegend(measure) {
    
    // empty div  
    $("#legend").empty();
    $("#legend").show();
    
    if (measure.style.type == "range") {
        $.each(measure.style.breaks, function(index, value) {
            if (index == measure.style.breaks.length - 1) {              
                $("#legend").append('<div><span style="background-color: ' + measure.style.colors[index] + '"></span>> ' + value + measure.style.units + '</div>');
            }
            else {
                $("#legend").append('<div><span style="background-color: ' + measure.style.colors[index] + '"></span>' + value + ' - ' + measure.style.breaks[index + 1] + measure.style.units + '</div>');
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
          featureType: 'all',
          stylers: [{
            saturation: -99
          }]
        }, {
          featureType: 'poi',
          stylers: [{
            visibility: 'off'
          }]
        }, {
          featureType: 'road',
          stylers: [{
            visibility: 'off'
          }]
        },        
        {
          featureType: "administrative.locality",
          elementType: "labels",
          stylers: [
            { visibility: "off" }
          ]
        },{
          featureType: "administrative.neighborhood",
          elementType: "labels",
          stylers: [
            { visibility: "off" }
          ]
        },{
          featureType: "administrative.land_parcel",
          elementType: "labels",
          stylers: [
            { visibility: "off" }
          ]
        },{
          featureType: "landscape",
          elementType: "labels",
          stylers: [
            { visibility: "off" }
          ]
        },{
          featureType: "poi",
          elementType: "labels",
          stylers: [
            { visibility: "off" }
          ]
        },{
          featureType: "road",
          elementType: "all",
          stylers: [
            { visibility: "off" }
          ]
        },{
          featureType: "transit",
          elementType: "all",
          stylers: [
            { visibility: "off" }
          ]
        },{
          featureType: "water",
          elementType: "labels",
          stylers: [
            { visibility: "off" }
          ]
        }
    ];

    var styledMapType = new google.maps.StyledMapType(style, {
      map: map,
      name: 'Styled Map'
    });
    map.mapTypes.set('map-style', styledMapType);
    map.setMapTypeId('map-style');
}