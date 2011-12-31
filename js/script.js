/* Author: Tobin Bradley

*/
var FTmeta;  // Metrics JSON
var map, marker, layer, geocoder; // Variables to support the map
var activeRecord = {}; // Holder for data in selected record
var countyAverage = {}; // Holder for county averages
var tableID = 1844838;  // ID of the fusion table layer
var wsbase = "http://maps.co.mecklenburg.nc.us/rest/";   // Base URL for REST web services

/**
 * Map Configuration Elements
 */
var mapCenterZoom = { lat: 35.260, lng: -80.817, zoom: 10 };


$(document).ready(function() {

    // Load JSON metric configuration
    $.ajax({
        url: "js/metrics.json",
        dataType: "json",
        async: false,
        success: function(data){
            FTmeta = data;
        }
    });
    
    
	// Dialogs
	$("#report-dialog").dialog({ width: 360, maxHeight: 550, autoOpen: false, show: 'fade', hide: 'fade', modal: true });
	$("#tutorial-dialog").dialog({ width: 510, autoOpen: false, show: 'fade', hide: 'fade', modal: true	});
	
	// Click events
	$("#report").click(function(){ $('#report-dialog').dialog('open') });
	$("#translate").click(function(){ $('#google_translate_element').toggle() });
	$("#tutorial").click(function(){ $('#tutorial-dialog').dialog('open') });
	$("#searchbox").click(function() { $(this).select(); });
    
    // Set hidden value in PDF report form    
    $("#report-dialog").delegate("input[type=checkbox]", "change", function(){
        reportCheckboxBuffer = [];
        $("#report-dialog input[type=checkbox]").each(function() {
            if ($(this).is(":checked")) reportCheckboxBuffer.push( $(this).attr("id") );
        });
        $("#report_measures").val(reportCheckboxBuffer.join());
    });
	
	// Add elements to mapIndicie
    writebuffer = "";    
    $.each(FTmeta, function(index) {
       writebuffer += '<option value="' + this.field + '">' + capitaliseFirstLetter(this.category) + ': ' + this.title + '</option>';
    });
    $("#mapIndicie").append(writebuffer);
    
    // Select first element of mapIndicie
    $("#mapIndicie option").first().attr('selected', 'selected');
	
	// return to initial layout
	$("#selectNone").click(function(){
        $("#selected-summary").hide("fade", {}, 400, function() {  $("#welcome").show("fade", {}, 400);  });
	});
	
	
	// Map measure drop down list
	$("#mapIndicie").change(function(){
        measure = FTmeta[$("#mapIndicie option:selected").val()];
		// Change map style
		styleFusionTable(measure);
		// update data
		if (!$("#selected-summary").is(':hidden'))  updateData(measure);
	});
	
	// Autocomplete
	$("#searchbox").autocomplete({
		 minLength: 4,
		 delay: 300,
		 source: function(request, response) {
		   
			  $.ajax({
				   url: wsbase + "v2/ws_geo_ubersearch.php",
				   dataType: "jsonp",
				   data: {
						searchtypes: "Address,Library,School,Park,GeoName,Road,CATS,Intersection,PID",
						query: request.term
				   },
				   success: function(data) {
						if (data.total_rows > 0) {
							 response($.map(data.rows, function(item) {
								  return {
									   label: urldecode(item.row.displaytext),
									   value: item.row.displaytext,
									   responsetype: item.row.responsetype,
									   responsetable: item.row.responsetable,
									   getfield: item.row.getfield,
									   getid: item.row.getid
								  }
							 }));
							
						}
						else if  (data.total_rows == 0) {
							 response($.map([{}], function(item) {
								  return {
									   // Message indicating nothing is found
									   label: "No records found."
								  }
							 }))
						}
						else if  (data.total_rows == -1) {
							 response($.map([{}], function(item) {
								  return {
									   // Message indicating no search performed
									   label: "More information needed for search."
								  }
							 }))
						}
				   }
			  })
		 },
		 select: function(event, ui) {
			  // Run function on selected record
			  if (ui.item.responsetype) {
				   locationFinder(ui.item.responsetype, ui.item.responsetable, ui.item.getfield, ui.item.getid, ui.item.label, ui.item.value);
			  }
		 }
	}).keypress(function(e) {
          if (e.keyCode === 13) $(this).autocomplete( "search");
     }).data("autocomplete")._renderMenu = function (ul, items) {
		 var self = this, currentCategory = "";
		 $.each( items, function( index, item ) {
			  if ( item.responsetype != currentCategory && item.responsetype != undefined) {
				   ul.append( "<li class='ui-autocomplete-category'>" + item.responsetype + "</li>" );
				   currentCategory = item.responsetype;
			  }
			  self._renderItem( ul, item );
		 });
	};
    
    // get county averages
	url = "https://www.google.com/fusiontables/api/query/?sql=SELECT AVERAGE(character_1), AVERAGE(character_2), AVERAGE(character_3), AVERAGE(engagement_1), AVERAGE(engagement_2), AVERAGE(engagement_3), AVERAGE(green_1), AVERAGE(green_2), AVERAGE(green_3), AVERAGE(health_1), AVERAGE(health_2), AVERAGE(health_3), AVERAGE(education_1), AVERAGE(education_2), AVERAGE(education_3), AVERAGE(safety_1), AVERAGE(safety_2), AVERAGE(safety_3), AVERAGE(housing_1), AVERAGE(housing_2), AVERAGE(housing_3), AVERAGE(economics_1), AVERAGE(economics_2), AVERAGE(economics_3) FROM 1844838&jsonCallback=?";
	$.getJSON(url, function(data) {					  						 
		if (data.table.rows.length > 0) {
			$.each(data.table.cols, function(i, item){
				countyAverage[item] = Math.round(data.table.rows[0][i]);
			});			
		}
		else {
			console.log("Unable to get county averages from Fusion Tables.");
		}
	});
  
});


/**
 * Window load events
 */
$(window).load(function(){
	// load map
	mapInit();
    
    // Load neighborhood ID's into report select
    url = "https://www.google.com/fusiontables/api/query/?sql=SELECT ID FROM 1844838 ORDER BY ID&jsonCallback=?";
	$.getJSON(url, function(data) {					  						 
		if (data.table.rows.length > 0) {
            buffer = "";			
            $.each(data.table.rows, function(i, item){
                buffer += '<option>' + 	item[0] + '</option>';			
			});
            $("#report_neighborhood").html(buffer);
		}
		else {
			console.log("Unable to get county averages from Fusion Tables.");
		}
	});
    
    // Load measures into report list
    measurebuffer = "";    
    $.each(FTmeta, function(index) {
        measurebuffer += '<input type="checkbox" id="' + this.field + '" /><label for="' + this.field + '">' + capitaliseFirstLetter(this.category) + ': ' + this.title + '</label><br />';
    });
    $("#report-metrics").append(measurebuffer);

	// Detect arguments
	if (getUrlVars()["n"]) {		
		selectNeighborhoodByID(getUrlVars()["n"]);
	}
	if (getUrlVars()["m"]) {		
        $("#mapIndicie").val(getUrlVars()["m"]).attr('selected', 'selected');
        styleFusionTable(FTmeta[getUrlVars()["m"]]);
	}
});


/**
 * Assign data to active record
 */
function assignData(data) {
	$.each(data.cols, function(i, item){
		activeRecord[item] = data.rows[0][i];
	});

    // Select neighborhood in report
    $("#report_neighborhood option[selected]").removeAttr("selected");
    $("#report_neighborhood option").each(function() {
        if ($(this).text() == activeRecord["ID"]) $(this).attr('selected', 'selected');
    });
    
}


/**
 * Update detailed data
 */
function updateData(measure) {
    // set neighborhood overview
	$("#selectedNeighborhood").html("Neighborhood " + activeRecord.ID);	
    
    // set details info
	$(".measureDetails h3").html(measure.title + '<a href="javascript:void(0)" class="transition">' + capitaliseFirstLetter(measure.category) + '</a>' );
    $("#indicator_description").html(measure.description);
    $("#indicator_why").html(measure.importance);
    $("#indicator_technical").html(measure.tech_notes);
    $("#indicator_source").html(measure.source);
    //$("#indicator_resources").html(measure.links);
    $("#indicator_resources").empty();
    $.each(measure.links.text, function(index, value) { 
        $("#indicator_resources").append('<a href="' + measure.links.links[index] + '">' + measure.links.text[index] + '</a><br />');
    });
    
    // create permalink
	permalink();

    // update chart
	$("#details_chart img").attr("src", "http://chart.apis.google.com/chart?chf=bg,s,00000000&chxr=0,0,100&chxl=1:|2010&chxt=x,y&chbh=a,4,9&chs=350x75&cht=bhg&chco=4D89F9,C6D9FD&chds=0,100,0,100&chd=t:" + activeRecord[measure.field] + "|" + countyAverage["AVERAGE(" + measure.field + ")"] + "&chdl=Neightborhood|County+Average&chdlp=t&chg=-1,0");
    
    // Show
    $("#welcome").hide("fade", {}, 400, function() {  $("#selected-summary").show("fade", {}, 400);  });
        
    
	
}


/**
 * Create permalink
 */
function permalink() {
	// get measure
	val = $("#mapIndicie option:selected").val();
	
	$("#permalink a").html("http://maps.co.mecklenburg.nc.us/qoldashboard/?n=" + activeRecord.ID + "&m=" + val);
	$("#permalink a").attr("href", "./?n=" + activeRecord.ID + "&m=" + val);
}


/**
 * Find locations
 * @param {string} findType  The type of find to perform
 * @param {string} findTable  The table to search on
 * @param {string} findField  The field to search in
 * @param {string} findID  The value to search for
 */
function locationFinder(findType, findTable, findField, findID, findLabel, findValue) {
	switch (findType) {
		case "Address": case "PID": case "API":
			url = wsbase + 'v1/ws_mat_addressnum.php?format=json&callback=?&jsonp=?&addressnum=' + findID;
			$.getJSON(url, function(data) {					  
				if (data.total_rows > 0) {
					$.each(data.rows, function(i, item){
						addMarker(item.row.longitude, item.row.latitude, 0, "<h3>Selected Property</h3><p>" + item.row.address + "</p>");
					});
				}
			});
			break; 
		case "Library": case "Park": case "School": case "GeoName": case "CATS": 
			// Set list of fields to retrieve from POI Layers
			poiFields = {
				"libraries" : "x(transform(the_geom, 4326)) as lon, y(transform(the_geom, 4326)) as lat, '<h5>' || name || '</h5><p>' || address || '</p>' AS label",
				"schools_1011" : "x(transform(the_geom, 4326)) as lon, y(transform(the_geom, 4326)) as lat, '<h5>' || coalesce(schlname,'') || '</h5><p>' || coalesce(type,'') || ' School</p><p>' || coalesce(address,'') || '</p>' AS label",
				"parks" : "x(transform(the_geom, 4326)) as lon, y(transform(the_geom, 4326)) as lat, '<h5>' || prkname || '</h5><p>Type: ' || prktype || '</p><p>' || prkaddr || '</p>' AS label",
				"geonames" : "longitude as lon, latitude as lat, '<h3>' || name || '</h3>'  as label",
				"cats_light_rail_stations" : "x(transform(the_geom, 4326)) as lon, y(transform(the_geom, 4326)) as lat, '<h5>' || name || '</h5><p></p>' as label",
				"cats_park_and_ride" : "x(transform(the_geom, 4326)) as lon, y(transform(the_geom, 4326)) as lat, '<h5>' || name || '</h5><p>Routes ' || routes || '</p><p>' || address || '</p>' AS label"
			};
			url = wsbase + "v1/ws_geo_attributequery.php?format=json&geotable=" + findTable + "&parameters=" + urlencode(findField + " = " + findID) + "&fields=" + urlencode(poiFields[findTable]) + '&callback=?';
			$.getJSON(url, function(data) {					  
				$.each(data.rows, function(i, item){
					addMarker(item.row.lon, item.row.lat, 1, item.row.label);
				});
			});
			break;
		case "Road": 
			url = wsbase + "v1/ws_geo_getcentroid.php?format=json&geotable=" + findTable + "&parameters=streetname='" + findValue + "' order by ll_add limit 1&forceonsurface=true&srid=4326&callback=?";
			$.getJSON(url, function(data) {					  
				$.each(data.rows, function(i, item){
					addMarker(item.row.x, item.row.y, 1, "<h3>Road</h3><p>" + findValue + "</p>");
				});
			});
			
			break;
		case "Intersection": 
			url = wsbase + "v1/ws_geo_centerlineintersection.php?format=json&callback=?";
			streetnameArray = findID.split("&");
			args = "&srid=4326&streetname1=" + urlencode(jQuery.trim(streetnameArray[0])) + "&streetname2=" + urlencode(jQuery.trim(streetnameArray[1]));
			$.getJSON(url + args, function(data) {
				if (data.total_rows > 0 ) {						  
					$.each(data.rows, function(i, item){
						addMarker(item.row.xcoord, item.row.ycoord, 1, "<h3>Intersection</h3><p>" + findID + "</p>");
					});
				}
			});
			break;
	}
}







