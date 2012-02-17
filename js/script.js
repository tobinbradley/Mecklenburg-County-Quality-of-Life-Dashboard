/* Author: Tobin Bradley

*/
var FTmeta;  // Metrics JSON
var map, marker, layer, geocoder; // Variables to support the map
var activeRecord = {}; // Holder for data in selected record
var countyAverage = {}; // Holder for county averages
var tableID = 1844838;  // ID of the fusion table layer
var wsbase = "http://maps.co.mecklenburg.nc.us/rest/";   // Base URL for REST web services
var chartColors = new Array("63719B", "B9C5D5", "39457E", "4E68AB", "8E1146", "C13559", "5A6B78");

/* Some color palletes for the metrics.json styling
Reds ["#f4cccc", "#ea9999", "#e06666", "#cc0000", "#990000"]
Greens ["#d0e0e3","#a2c4c9","#76a5af","#45818e","#134f5c"]
Purples ["#d9d2e9", "#b4a7d6", "#8e7cc3", "#674ea7", "#351c75"]
*/ 

/**
 * Map Configuration Elements - customize for your location
 */
var mapCenterZoom = { lat: 35.260, lng: -80.817, zoom: 10 };


$(document).ready(function() {
    
    // Ugly hack to fix vertical spacing problem on google translate gadget
    if ($.browser.webkit) $("#google_translate_element").css("padding-top", "1px");    
    
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
	$("#report-dialog").dialog({ width: 400, height: 250, autoOpen: false, show: 'fade', hide: 'fade', modal: true });
	$("#tutorial-dialog").dialog({ width: 510, autoOpen: false, show: 'fade', hide: 'fade', modal: true	});
    $("#search-dialog").dialog({ width: 320, autoOpen: false, show: 'fade', hide: 'fade', modal: true });
    $("#disclaimer-dialog").dialog({ width: 550, autoOpen: false, show: 'fade', hide: 'fade', modal: true });
	
    // Show GPS link if browser support
    if (Modernizr.geolocation) $("#gpsarea").show();
    
	// Click events
	$("#report").click(function(){ $('#report-dialog').dialog('open') });
	$("#tutorial").click(function(){ $('#tutorial-dialog').dialog('open') });
    $("#searchhelp").click(function(){ $('#search-dialog').dialog('open') });
    $("#gps").click(function() { tryGPS() });
    $( "input:submit" ).button();
	$("#searchbox").click(function() { $(this).select(); });
	$("#selectNone").click(function(){
        $("#selected-summary, #metricslist").hide();
        $("#welcome").show("fade", {}, 1500);  
	});
    $("#showMetricslist").click(function(){
        $("#selected-summary, #welcome").hide();
        $("#metricslist").show("fade", {}, 1500); 
	});    
    
    // URL Hash Change Handler
    // This bit powers a lot of stuff
    $(window).hashchange( function(){
        if (window.location.hash.length > 0) {
            // read the hash            
            theHash = window.location.hash.replace("#","").split("/");
            
            // Process the neighborhood           
            if (theHash[1] && theHash[1].length > 0 && theHash[1] != activeRecord.ID) {
                if (theHash[1].indexOf(",") == -1) {               
                    selectNeighborhoodByID(theHash[1]);                
                }
                else {
                    coords = theHash[1].split(",");
                    performIntersection(coords[0], coords[1]);
                }
            }                
           
            // Process the selected
            if (theHash[0].length > 0 && $('#mapIndicie option[value=' + theHash[0] + ']').length > 0 ) {                
                $("#mapIndicie").val(theHash[0]).attr('selected', 'selected');
                $("#map select").multiselect('refresh');
                styleFusionTable(FTmeta[theHash[0]]);
                if (jQuery.isEmptyObject(activeRecord) == false) {
                    updateData(FTmeta[theHash[0]]);
                    $("#welcome, #metricslist").hide();
                    $("#selected-summary").show("fade", {}, 400);
                }   
            }
        }
    });
    
    
	// Fill out Map select, report select, metrics list from metrics.json
    writebuffer = "";
    writebuffer2 = "";
    category = "";
    $.each(FTmeta, function(index) {             
        if (index == 0 || this.category != category) {
            if (index != 0) writebuffer += '</optgroup>';            
            writebuffer += '<optgroup label="' + capitaliseFirstLetter(this.category) + '">';
            writebuffer2 += "<h4>" + capitaliseFirstLetter(this.category) + "</h4>";            
            category = this.category;
        }
        writebuffer += '<option value="' + this.field + '">' + this.title + '</option>';
        writebuffer2 += '<a href="javascript:void(0)" onclick="changeMeasure(\'' + this.field + '\')" class="quickLink">' + this.title + '</a><br />';
    });
    writebuffer += '</optgroup>';
    $("#mapIndicie, #report_metrics").html(writebuffer);
    $("#metricslist").html(writebuffer2);
    $("#mapIndicie option").sort(sortAlpha).appendTo("#mapIndicie");
    //$("#report_metrics optgroup option").sort(sortAlpha).appendTo("#report_metrics");
    var options = $("#mapIndicie > option");
    var random = Math.floor(options.length * (Math.random() % 1));
    options.eq(random).attr('selected',true);
    $("#map select").multiselect({ minWidth: 300, height: 250, multiple: false,  selectedList: 1}).multiselectfilter();
    $("#report_measures select").multiselect({ minWidth: 375, height: 250 }).multiselectfilter(); 
	
	
	// Map measure drop down list change
	$("#mapIndicie").change(function(){ window.location.hash = $(this).val() + ((activeRecord.ID) ? "/" + activeRecord.ID : "/") });
    
	
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
		 },
         open: function(event, ui) {
            $(this).keypress(function(e){
                /* horizontal keys */
                if (e.keyCode == 13 || e.keyCode == 39) {
                   $($(this).data('autocomplete').menu.active).find('a').trigger('click');
                }
            });
            if ($("ul.ui-autocomplete li.ui-menu-item").length == 1) {
                //$($(this).data('autocomplete').menu.active).find('a').trigger('click');
            }
         }
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
	url = "https://www.google.com/fusiontables/api/query/?sql=SELECT " + getFieldsAverageArray(FTmeta).join() + " FROM " + tableID + "&jsonCallback=?";
	$.getJSON(url, function(data) {					  						 
		if (data.table.rows.length > 0) {
			$.each(data.table.cols, function(i, item){
				countyAverage[item] = Math.round(data.table.rows[0][i]);
			});
            // populate 3 random percentage charts on the front page
            var measureTitle = new Array();
            var measureValue = new Array();
            var measureKey = new Array();
            // populate arrays from % measures
            $.each(countyAverage, function(key, value) {
                if (FTmeta[key].style.units == "%") {
                    measureTitle.push(FTmeta[key].title);
                    measureKey.push(key);
                    measureValue.push(value);
                }
            });
            // push 3 random charts to front page
            for (i=0;i<3;i++) {
                index = Math.floor(Math.random() * measureTitle.length);
                chartURL = "http://chart.apis.google.com/chart?chxt=y&chco=FF9900,7777CC|008000&chxl=0:|0|100%&chxp=0,0,100&chs=150x100&cht=gm&chts=676767,10&chd=t:" + measureValue[index] + "&chtt=" + measureTitle[index];
                $("#welcomeCharts").append('<a href="javascript:void(0)" onclick="changeMeasure(\'' + measureKey[index] + '\')"><img src="' + chartURL + '" width="150" /></a>');
                // remove used items from arrays
                measureTitle.splice(index, 1);
                measureKey.splice(index, 1);
                measureValue.splice(index, 1);
            }
            
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
    
    
    // Detect arguments or GPS
    if (window.location.hash.length > 0) {
        $(window).trigger( 'hashchange' );
    }
    else if (Modernizr.geolocation) {
        //tryGPS();
	} 
    
});



/**
 * Change the active measure
 */
function changeMeasure(theMeasure) {
    window.location.hash = theMeasure + ((activeRecord.ID) ? "/" + activeRecord.ID : "/");
}


/**
 * Try GPS
 */
function tryGPS() {
    if (Modernizr.geolocation) {      
        navigator.geolocation.getCurrentPosition(
            function(position) {             
                window.location.hash = window.location.hash.replace("#","").split("/")[0] + "/" + position.coords.latitude + "," + position.coords.longitude;
            },
            function() { console.log("Problem with the Geolocation."); },
            {enableHighAccuracy:true, maximumAge:30000, timeout:10000}
        );
	}
}


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
	$("#selectedNeighborhood").html("Neighborhood Profile Area " + activeRecord.ID + "<br />" + activeRecord[measure.field] + measure.style.units);	
    
    // set details info
	$(".measureDetails h3").html(measure.title );
    $("#indicator_description").html(measure.description);
    $("#indicator_why").html(measure.importance);
    $("#indicator_technical").html(measure.tech_notes);
    $("#indicator_source").html(measure.source);
    $("#indicator_resources").empty();
    $.each(measure.links.text, function(index, value) { 
        $("#indicator_resources").append('<a href="' + measure.links.links[index] + '">' + measure.links.text[index] + '</a><br />');
    });
    
    // Quick links
    if (measure.quicklinks) {
        quicklinks = new Array();        
        $.each(measure.quicklinks, function(index, value) { 
            quicklinks[index] = '<a href="javascript:void(0)" class="quickLink" onclick="changeMeasure(\'' + value + '\')">' + FTmeta[value].title + '</a>';            
        });
        $("#indicator_quicklinks").html('<h4>Related Metrics</h4>' + quicklinks.join(", "));
    }
    else $("#indicator_quicklinks").empty();
    
    // update chart
    activeRecord[measure.field] >  countyAverage[measure.field] ? chartmax = activeRecord[measure.field] : chartmax = countyAverage[measure.field];
    chartmax <= 100 ? chartmax = 100 : chartmax = chartmax + 100; 
    $("#details_chart img").attr("src", "http://chart.apis.google.com/chart?chf=bg,s,00000000&chxr=0,0," + chartmax + "&chxl=1:|2010&chxt=x,y&chbh=a,4,9&chs=350x75&cht=bhg&chco=4D89F9,C6D9FD&chds=0," + chartmax + ",0," + chartmax + "&chd=t:" + activeRecord[measure.field] + "|" + countyAverage[measure.field] + "&chdl=Neightborhood|County+Average&chdlp=t&chg=-1,0");
    
    // aux chart
    if (measure.auxchart) { auxChart(measure); }
    else { $("#indicator_auxchart").empty(); }
    
    // Show
    $("#welcome, #metricslist").hide();
    $("#selected-summary").show("fade", {}, 1500); 

}


/**
 * Extra chart
 */
function auxChart(measure) {
    measureTitles = new Array();
    measureValues = new Array();
    auxContent = "http://chart.apis.google.com/chart?chs=300x225&cht=p&chp=0.1";    
    
    i = 0;
    $.each(measure.auxchart.measures, function(index, value) {
        if (activeRecord[value] > 0) {        
            measureTitles[i] = FTmeta[value].title;
            measureValues[i] = activeRecord[value];
            i++;
        }
    });    
    auxContent = "http://chart.apis.google.com/chart?chf=bg,s,00000000&chs=300x165&cht=p&chp=0.1";
    
    if (measure.auxchart.type == "pie") {
        auxContent += "&chd=t:" + measureValues.join() + "&chdl=" + measureTitles.join("|") + "&chco=" + chartColors.join();
    }
    
    $("#indicator_auxchart").html('<img src="' + auxContent + '" />');
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
						performIntersection(item.row.longitude, item.row.latitude);
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
                    performIntersection(item.row.lon, item.row.lat);
				});
			});
			break;
		case "Road": 
			url = wsbase + "v1/ws_geo_getcentroid.php?format=json&geotable=" + findTable + "&parameters=streetname='" + findValue + "' order by ll_add limit 1&forceonsurface=true&srid=4326&callback=?";
			$.getJSON(url, function(data) {					  
				$.each(data.rows, function(i, item){
                    performIntersection(item.row.x, item.row.y);
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
                        performIntersection(item.row.xcoord, item.row.ycoord);
					});
				}
			});
			break;
	}
}







