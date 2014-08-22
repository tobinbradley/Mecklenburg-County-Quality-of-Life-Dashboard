var map,                // leaflet map
    quantize,           // d3 quantizer for color breaks
    x_extent,           // extent of the metric, including all years
    metricData = [],    // each element is object {'year': the year, 'map': d3 map of data}
    accuracyData = [],
    rawData = [],
    rawAccuracy = [],
    timer,              // timer for year slider
    year,               // the currently selected year as array index of metricData
    barchartWidth,      // for responsive charts
    marker,             // marker for geocode
    trendChart,
    valueChart,
    d3Layer,
    tour,
    precincts = {};

function loadPrecincts() {
  $.getJSON('data/precincts.geojson', function(precinctJson) {
    _.each(precinctJson.features, function(feature) {
      precincts[feature.properties.OBJECTID - 1] = feature.properties.NAME;
    });
  });
}
function precinctName(id) {
  return precincts[id];
}

_.templateSettings.variable = "rc";

PubSub.immediateExceptions = true; // set to false in production

String.prototype.commafy = function () {
    return this.replace(/(^|[^\w.])(\d{4,})/g, function($0, $1, $2) {
        return $1 + $2.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,");
    });
};
Number.prototype.commafy = function () {
    return String(this).commafy();
};

// Detect placeholder support for IE9
jQuery.support.placeholder = (function(){
    var i = document.createElement('input');
    return 'placeholder' in i;
})();

// This function only relevant if using month-over-month

// function nameMonth(year) {
//     var monthNumber = {
//         "01": "January",
//         "02": "February",
//         "03": "March",
//         "04": "April",
//         "05": "May",
//         "06": "June",
//         "07": "July",
//         "08": "August",
//         "09": "September",
//         "10": "October",
//         "11": "November",
//         "12": "December"
//     };

//     var yearNums = year.replace('y_', '');
//     var yearMonth = yearNums.split('-');
//     var sliderTitle = monthNumber[yearMonth[1]] + " " + yearMonth[0];
//     return sliderTitle;

// }

// Slider change event - month-over-month
// function sliderChange(value) {

//     var sliderText = metricData[value].year.replace()
//     $('.time-year').text(nameMonth(metricData[value].year));
//     year = value;
//     PubSub.publish('changeYear');
// }

// Slider change event - year-over-year
function sliderChange(value) {

    $('.time-year').text(metricData[value].year.replace("y_", ""));
    year = value;
    PubSub.publish('changeYear');
}

function getURLParameter(name) {
    return decodeURI(
        (new RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}

$(document).ready(function () {

  loadPrecincts();

    // pubsub subscriptions
    PubSub.subscribe('initialize', initMap);
    PubSub.subscribe('initialize', initTypeahead);
    PubSub.subscribe('changeYear', drawMap);
    PubSub.subscribe('changeYear', drawBarChart);
    PubSub.subscribe('changeYear', updateTable);
    PubSub.subscribe('changeYear', updateCountyStats);
    PubSub.subscribe('changeMetric', processMetric);
    PubSub.subscribe('changeMetric', drawMap);
    PubSub.subscribe('changeMetric', drawBarChart);
    PubSub.subscribe('changeMetric', drawLineChart);
    PubSub.subscribe('changeMetric', updateMeta);
    PubSub.subscribe('changeMetric', updateTable);
    PubSub.subscribe('changeMetric', updateCountyStats);
    PubSub.subscribe('recordHistory', recordMetricHistory);
    PubSub.subscribe('selectGeo', d3Select);
    PubSub.subscribe('geocode', d3Select);
    PubSub.subscribe('geocode', d3Zoom);
    PubSub.subscribe('geocode', addMarker);
    PubSub.subscribe('findNeighborhood', d3Select);
    PubSub.subscribe('findNeighborhood', d3Zoom);

    
    // THIS REFERS TO OLD NAV
    // Start with random metric if none passed
    // if (getURLParameter("m") !== "null") {
    //     $("#metric option[value='" + getURLParameter('m') + "']").prop('selected', true);
    // }
    // else {
    //     var $options = $('.chosen-select').find('option'),
    //         random = Math.floor((Math.random() * $options.length));
    //     $options.eq(random).prop('selected', true);
    // }


    // Start with random metric if none passed
    if (getURLParameter('m') !== 'null') {
        $("#js-category li[data-category='" + getURLParameter('m') + "']").addClass('active');
    }
    else {
        var $options = $('#js-category').find('li'),
            random = Math.floor((Math.random() * $options.length));
        $options.eq(random).addClass('active');
        $('.chosen-select').find('option').eq(random).prop('selected', true);
    }

    // set window popstate event
    if (history.pushState) {
        window.addEventListener("popstate", function(e) {
            if (getURLParameter("m") !== "null") {
                PubSub.unsubscribe(recordMetricHistory);
                $("#metric option[value='" + getURLParameter('m') + "']").prop('selected', true);
                $('#metric').chosen().change();
                PubSub.subscribe("recordHistory", recordMetricHistory);
            }
        });
    }

    // chosen
    $(".chosen-select").chosen({width: '100%', no_results_text: "Not found - "}).change(function () {
        var theVal = $(this).val();
        fetchMetricData(theVal);
        $(this).trigger("chosen:updated");
        PubSub.publish("recordHistory", {});
    });
    $(".chosen-search input").prop("placeholder", "search metrics");

    // Don't let clicked toggle buttons remain colored
    $(".datatoggle").on("focus", "button", function() { $(this).blur(); });

    // Clear selected button
    $(".select-clear").on("click", function() {
        d3.selectAll(".geom").classed("d3-select", false);
        d3.select(".value-select").selectAll("rect, line, text, circle").remove();
        d3.selectAll(".trend-select").selectAll("path, circle").remove();
        $(".datatable-container tbody tr").remove();
        $(".stats-selected").text("N/A");
        try { map.removeLayer(marker); }
        catch (err) {}
    });

    // Toggle table button
    $(".toggle-table").on("click", function() {
        var txt = $(".datatable-container").is(':visible') ? 'Show Data' : 'Hide Data';
        $(this).text(txt);
        $(".datatable-container").toggle("slow");
    });

    // Toggle map button
    $(".toggle-map").on("click", function() {
        var txt = $(this).text() === "Show Map" ? 'Hide Map' : 'Show Map';
        if (txt !== "Hide Map") {
            $(".geom").css("fill-opacity", "1");
            $(".leaflet-overlay-pane svg path:not(.geom)").css("stroke-opacity", "1");
            map.removeLayer(baseTiles);
        } else {
            $(".geom").css("fill-opacity", "0.7");
            $(".leaflet-overlay-pane svg path:not(.geom)").css("stroke-opacity", "0.6");
            map.addLayer(baseTiles);
        }
        $(this).text(txt);
    });

    // joyride
    var tour = $('#dashboard-tour').tourbus({});
    $('.btn-help').on("click", function() {
        tour.trigger('depart.tourbus');
    });


    // Track outbound resource links
    // $(".meta-resources").on("mousedown", "a", function(e){
    //     if (window.ga && e.which !== 3) {
    //         ga('send', 'event', 'resource', $(this).text().trim(), $("#metric option:selected").text().trim());
    //     }
    // });

    // contact form
    $(".contact form").submit(function(e) {
        e.preventDefault();
        $(".contact").dropdown("toggle");
        // send feedback
        if ($("#message").val().trim().length > 0) {
            $.ajax({
                type: "POST",
                url: "/utilities/feedback.php",
                data: {
                    email: $("#email").val(),
                    url: window.location.href,
                    agent: navigator.userAgent,
                    subject: "Quality of Life Dashboard Feedback",
                    to: "tobin.bradley@gmail.com",
                    message: $("#message").val()
                }
            });
        }
    });
    $('.dropdown .contact input').click(function(e) {
        e.stopPropagation();
    });


    // set up map
    L.Icon.Default.imagePath = './images';
    map = L.map("map", {
            attributionControl: false,
            touchZoom: true,
            minZoom: mapGeography.minZoom,
            maxZoom: mapGeography.maxZoom,
            scrollWheelZoom: false
        }).setView(mapGeography.center, mapGeography.defaultZoom);
    var baseTiles = L.tileLayer(baseTilesURL).addTo(map);

    // Year control
    var yearControl = L.control({position: 'bottomright'});
    yearControl.onAdd = function(map) {
        this._div = L.DomUtil.create('div', 'yearDisplay time text-right');
        this._div.innerHTML = '<h3 class="time-year">2012</h3><button type="button" class="btn btn-primary btn-looper"><span class="glyphicon glyphicon-play"></span></button><div class="slider"></div>';
        return this._div;
    };
    yearControl.addTo(map);


    // time slider and looper
    $(".slider").slider({
        value: 1,
        min: 0,
        max: 1,
        step: 1,
        animate: true,
        slide: function( event, ui ) {
            sliderChange(ui.value);
        }
    });
    $(".btn-looper").on("click", function () {
        var that = $(this).children("span");
        var theSlider = $('.slider');
        if (that.hasClass("glyphicon-play")) {
            that.removeClass("glyphicon-play").addClass("glyphicon-pause");
            if (theSlider.slider("value") === theSlider.slider("option", "max")) {
                theSlider.slider("value", 0);
            }
            else {
                theSlider.slider("value", theSlider.slider("value") + 1);
            }
            sliderChange(theSlider.slider("value"));
            timer = setInterval(function () {
                    if (theSlider.slider("value") === theSlider.slider("option", "max")) {
                        theSlider.slider("value", 0);
                    }
                    else {
                        theSlider.slider("value", theSlider.slider("value") + 1);
                    }
                    sliderChange(theSlider.slider("value"));
                }, 3000);
        }
        else {
            that.removeClass("glyphicon-pause").addClass("glyphicon-play");
            clearInterval(timer);
        }
    });

    // // Only show map when zoomed in
    // map.on("zoomend", function() {
    //     if (map.getZoom() >= mapGeography.baseTileVisible) {
    //         $(".geom").css("fill-opacity", "0.5");
    //         $(".leaflet-overlay-pane svg path:not(.geom)").css("stroke-opacity", "0");
    //         map.addLayer(baseTiles);
    //     } else {
    //         $(".geom").css("fill-opacity", "1");
    //         $(".leaflet-overlay-pane svg path:not(.geom)").css("stroke-opacity", "0.6");
    //         map.removeLayer(baseTiles);
    //     }
    // });

    // geolocate if on a mobile device
    // bit hacky here on detection, but should cover most things
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        map.locate({setView: false});
        map.on('locationfound', function(e) {
            $.ajax({
                url: 'http://maps.co.mecklenburg.nc.us/rest/v2/ws_geo_pointoverlay.php',
                type: 'GET',
                dataType: 'jsonp',
                data: {
                    'x': e.latlng.lng,
                    'y': e.latlng.lat,
                    'srid': 4326,
                    'table': 'neighborhoods',
                    'fields': 'id'
                },
                success: function (data) {
                    var sel = d3.select(".geom [data-id='" + data[0].id + "']");
                    PubSub.publish('geocode', {
                        "id": data[0].id,
                        "value": sel.attr("data-value"),
                        "d3obj": sel,
                        "lat": e.latlng.lat,
                        "lng": e.latlng.lng
                    });
                }
            });
        });
    }

    // initialize charts
    trendChart = lineChart();
    valueChart = barChart();

    // window resize so charts change
    d3.select(window).on("resize", function () {
        if ($(".barchart").parent().width() !== barchartWidth) {
            drawBarChart();
            drawLineChart();
        }
    });


    // kick everything off
    fetchMetricData($("#metric").val());

});

function draw(geom) {
    PubSub.publish('initialize', {
        "geom": geom
    });
}

$("#js-category li").on("click",function(){
    $("#js-category li").removeClass("active");
    $(this).addClass("active");
    var theVal = $(this).data("category");
    fetchMetricData(theVal);
    $(".chosen-select").val(theVal).trigger("chosen:updated");
});


function changeMetric(data) {
    var theVal = $("#metric").val();
    $(".d3-tip").remove();
    PubSub.publish('changeMetric', {
        'metricdata': data,
        'metric': theVal
    });
}

function processMetric(msg, data) {
    // get current year if available so slider can find nearest
    if (_.isNumber(year)) {
        var prevYear = parseInt(metricData[year].year.replace("y_", ""));
    }

    // clear metric data
    metricData.length = 0;

    var keys = Object.keys(data.metricdata[0]);
    for (var i = 1; i < keys.length; i++) {
        metricData.push({"year": keys[i], "map": d3.map()});
    }

    // set slider and time related stuff - month-over-month
    // year = 41; // months numbered with January 2011 as 0, so 41 represents June 2014
    // $(".slider").slider("option", "max", metricData.length - 1).slider("value", year);
    // metricData.length > 1 ? $(".time").fadeIn() : $(".time").hide();
    // $('.time-year').text(nameMonth(metricData[year].year));

    // _.each(data.metricdata, function (d) {
    //     for (var i = 0; i < metricData.length; i++) {
    //         if ($.isNumeric(d[metricData[i].year])) { metricData[i].map.set(d.id, parseFloat(d[metricData[i].year])); }
    //     }
    // });

    // set slider and time related stuff - year-over-year
     year = metricData.length -1;
     $(".slider").slider("option", "max", metricData.length - 1).slider("value", year);
     metricData.length > 1 ? $(".time").fadeIn() : $(".time").hide();
     $('.time-year').text(metricData[year].year.replace("y_", ""));
 
     _.each(data.metricdata, function (d) {
         for (var i = 0; i < metricData.length; i++) {
             if ($.isNumeric(d[metricData[i].year])) { metricData[i].map.set(d.id, parseFloat(d[metricData[i].year])); }
         }
     });

    // Set up extent
    var extentArray = [];
    _.each(metricData, function(d) { extentArray = extentArray.concat(d.map.values()); });
    x_extent = d3.extent(extentArray);

    // set up quantile
    quantize = d3.scale.quantile()
        .domain(x_extent)
        .range(d3.range(colorbreaks).map(function (i) {
            return "q" + i;
        }));
}

function recordMetricHistory(msg, data) {
    // push metric to GA and state
    // Note I'm doing the text descript, not the little name, for clarity in analytics
    if (msg !== 'initialize') {
        if (history.pushState) {
            history.pushState({myTag: true}, null, "?m=" + $("#metric").val());
        }
        if (window.ga) {
            theMetric = $("#metric option:selected");
            ga('send', 'event', 'metric', theMetric.text().trim(), theMetric.parent().prop("label"));
        }
    }
}
