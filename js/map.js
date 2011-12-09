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
	
	// style the base map
	styleMap();
	
	
  
	// Add layer
	layer = new google.maps.FusionTablesLayer({ query: { select: 'geometry', from: tableID }, map: map });
	
	//add a click listener to the layer
	google.maps.event.addListener(layer, 'click', function(e) {
		//update the content of the InfoWindow
		e.infoWindowHtml = '<div class="googft-info-window"><h3>Neighborhood ' + e.row['ID'].value + "</h3>";
		e.infoWindowHtml += 'Score: ' + e.row[$("#mapIndicie option:selected").val()].value + '<br />';
		theID = $("#mapIndicie option:selected").val();
		e.infoWindowHtml += 'County Average: ' + countyAverage["AVERAGE(" + theID + ")"] + '<br />';
		e.infoWindowHtml += '<p><a href="javascript:void(0)" onclick="selectNeighborhoodByID(' + e.row['ID'].value + ')">Select Neighborhood</a></p>';
		e.infoWindowHtml += "</div>";
	});
	
	styleFusionTable(FTmeta[$("#mapIndicie option:selected").val()]);
    
    // Hack for fusion tables tiles not loading
	setTimeout(function(){ 
		$("img[src*='mapslt']").each(function(){ 
			$(this).attr("src",$(this).attr("src")+"&"+(new Date()).getTime());
		}); 
	},2000);

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
	map.setCenter(new google.maps.LatLng(lat, lon));
	map.setZoom(14);
	
	// Intersection
	performIntersection(lat, lon);
	
}


/**
 * Retrieve Data via intersect
 */
function performIntersection(lat, lon) {
	// Perform intersect
	url = "https://www.google.com/fusiontables/api/query/?sql=SELECT * FROM 1844838 WHERE ST_INTERSECTS(geometry, CIRCLE(LATLNG(" + lat + "," + lon + "),1))&jsonCallback=?";
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
	url = "https://www.google.com/fusiontables/api/query/?sql=SELECT * FROM 1844838 WHERE ID = " + idvalue + "&jsonCallback=?";
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

    theField = measure;    
    
    // highlight neighborhood if selected    
    neighborhood = (activeRecord.ID) ? activeRecord.ID : 0;

    var defined_styles = measure.style;
    var colors = defined_styles.colors;
    var min_num = defined_styles.min;
    var max_num = defined_styles.max;
    var step = (max_num - min_num) * 1.0 / colors.length;
    var mapStyleJSON =  []; 
    for (var j = 0; j < colors.length; j++) {

      var lower = step * j;
      var upper = step * (j + 1);
      if (j == colors.length - 1) {
        //textBlock.innerHTML = Math.round(lower) + '+';
        mapStyleJSON.push( { where: measure.field + " > " + lower, polygonOptions: { fillColor: colors[j], fillOpacity: 0.5 } });
      } else {
        //textBlock.innerHTML = Math.round(lower) + ' - ' + Math.round(upper);
        mapStyleJSON.push({ where: measure.field + " > " + lower + " and " + measure.field + " < " + upper, polygonOptions: { fillColor: colors[j], fillOpacity: 0.5 } });
      }

    }
    
    mapStyleJSON.push( { where: "ID = " + neighborhood, polygonOptions: { strokeColor: "#rrggbb", strokeWeight: 6 }});
    
    layer.setOptions({ styles: mapStyleJSON });
	
	// Hack for fusion tables tiles not loading
	/*setTimeout(function(){ 
		$("img[src*='mapslt']").each(function(){ 
			$(this).attr("src",$(this).attr("src")+"&"+(new Date()).getTime());
		}); 
	},2000);*/
    
    // Legend
	createLegend(measure);
}


/**
 * Functions to create legend
 */
// Legend
function createLegend(type) {
  var legendDiv = document.createElement('div');
  var legend = new Legend(legendDiv, type);
  legendDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_RIGHT].pop();
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(legendDiv);
}

// Generate the content for the legend
function Legend(controlDiv, type) {
  controlDiv.style.padding = '10px';
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = 'white';
  controlUI.style.borderStyle = 'solid';
  controlUI.style.borderWidth = '1px';
  controlUI.style.padding = '5px';
  controlUI.style.width = '80px';
  controlUI.style.height = '80px';
  controlUI.title = 'Legend';
  controlDiv.appendChild(controlUI);
  var controlText = document.createElement('div');
  legendContent(controlText, type);
  controlUI.appendChild(controlText);
}

function legendContent(controlText, type) {
  controlText.style.fontFamily = 'Arial,sans-serif';
  controlText.style.fontSize = '14px';
  controlText.style.padding = '4px';

  var header = document.createElement('p');
  header.style.margin = '0px 0px 5px 0px';
  header.style.fontWeight = 'bold';
  header.innerHTML = 'Legend';
  //controlText.appendChild(header);

  var defined_styles = type.style;
  var colors = defined_styles.colors;
  var min_num = defined_styles.min;
  var max_num = defined_styles.max;
  var step = (max_num - min_num) * 1.0 / colors.length;
  for (var j = 0; j < colors.length; j++) {
    var colorBlock = document.createElement('div');
    colorBlock.style.height = '15px';
    colorBlock.style.width = '10px';
    colorBlock.style.margin = '0px 3px 0px 0px';
    colorBlock.style.cssFloat = 'left';
    colorBlock.style.styleFloat = 'left';
    colorBlock.style.clear = 'both';
    colorBlock.style.background = colors[j];
    controlText.appendChild(colorBlock);

    var textBlock = document.createElement('p');
    textBlock.style.margin = '0px';
    textBlock.style.cssFloat = 'left';
    textBlock.style.styleFloat = 'left';
    textBlock.style.display = 'inline';
    var lower = step * j;
    var upper = step * (j + 1);
    if (j == colors.length - 1) {
      textBlock.innerHTML = Math.round(lower) + '+';
    } else {
      textBlock.innerHTML = Math.round(lower) + ' - ' + Math.round(upper);
    }
    controlText.appendChild(textBlock);
  }
}


var layer_styles = {
  'Base 100': {
    'min': 0,
    'max': 100,
    'colors': [
      '#e0ffd4',
      '#a5ef63',
      '#50aa00',
      '#1f5b10'
    ]
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
      { visibility: "off" }
    ]
  },{
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      { saturation: -100 },
      { lightness: 40 },
      { visibility: "simplified" }
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
      { lightness: -2 }
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
      { lightness: -2 }
    ]
  },{
    featureType: "water",
    elementType: "labels",
    stylers: [
      { lightness: -2 }
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
    name: 'Styled Map'
  });
  map.mapTypes.set('map-style', styledMapType);
  map.setMapTypeId('map-style');
}