var map,                // leaflet map
    quantize,           // d3 quantizer for color breaks
    x_extent,           // extent of the metric, including all years
    metricData = [],    // each element is object {'year': the year, 'map': d3 map of data}
    timer,              // timer for year slider
    year,               // the currently selected year as array index of metricData
    barchartWidth,      // for responsive charts
    mapcenter,           // hack to fix d3 click firing on leaflet drag
    marker,             // marker for geocode
    colorbreaks = 7     // the number of color breaks
    ;

PubSub.immediateExceptions = true; // set to false in production

String.prototype.commafy = function () {
    return this.replace(/(^|[^\w.])(\d{4,})/g, function($0, $1, $2) {
        return $1 + $2.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,");
    });
};
Number.prototype.commafy = function () {
    return String(this).commafy();
};

// Slider change event
function sliderChange(value) {
    $('.time-year').text(metricData[value].year.replace("y_", ""));
    year = value;
    PubSub.publish('changeYear');
}

$(document).ready(function () {

    // TODO: set metric selected if argument passed
    var $options = $('.chosen-select').find('option'),
        random = Math.floor((Math.random() * $options.length));
    $options.eq(random).prop('selected', true);

    // chosen
    $(".chosen-select").chosen({width: '100%', no_results_text: "Not found - "}).change(function () {
        var theVal = $(this).val();
        d3.csv("data/metric/" + theVal + ".csv", changeMetric);
        $(this).trigger("chosen:updated");
    });

    // clear selection button
    $(".select-clear").on("click", function() {
        d3.selectAll(".geom path").classed("d3-select", false);
        d3.selectAll(".mean-select .mean-triangle").remove();
    });

    // time slider
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

    // time looper
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

    // jQuery UI Autocomplete
    $("#searchbox").click(function () { $(this).select(); }).focus();
    $('.typeahead').typeahead([
        {
            name: 'Address',
            remote: {
                url: 'http://maps.co.mecklenburg.nc.us/rest/v4/ws_geo_ubersearch.php?searchtypes=address&query=%QUERY',
                dataType: 'jsonp',
                filter: function (data) {
                    var dataset = [];
                    _.each(data, function (item) {
                        dataset.push({
                            value: item.name,
                            label: item.name,
                            gid: item.gid,
                            pid: item.moreinfo,
                            layer: 'Address',
                            lat: item.lat,
                            lng: item.lng
                        });
                    });
                    var query = $(".typeahead").val();
                    if (dataset.length === 0 && $.isNumeric(query.split(" ")[0]) && query.trim().split(" ").length > 1) {
                        dataset.push({ value: "No records found." });
                    }
                    return dataset;
                }
            },
            minLength: 4,
            limit: 10,
            header: '<h4 class="typeahead-header"><span class="glyphicon glyphicon-home"></span> Address</h4>'
        }, {
            name: 'PID',
            remote: {
                url: 'http://maps.co.mecklenburg.nc.us/rest/v4/ws_geo_ubersearch.php?searchtypes=pid&query=%QUERY',
                dataType: 'jsonp',
                filter: function (data) {
                    var dataset = [];
                    _.each(data, function (item) {
                        dataset.push({
                            value: item.name,
                            label: item.moreinfo,
                            gid: item.gid,
                            pid: item.name,
                            layer: 'PID',
                            lat: item.lat,
                            lng: item.lng
                        });
                    });
                    var query = $(".typeahead").val();
                    if (dataset.length === 0 && query.length === 8 && query.indexOf(" ") === -1 && $.isNumeric(query.substring(0, 5))) {
                        dataset.push({ value: "No records found." }); }
                    return dataset;
                }
            },
            minLength: 8,
            limit: 5,
            header: '<h4 class="typeahead-header"><span class="glyphicon glyphicon-home"></span> Parcel</h4>'
        }, {
            name: 'POI',
            remote: {
                url: 'http://maps.co.mecklenburg.nc.us/rest/v4/ws_geo_ubersearch.php?searchtypes=park,library,school&query=%QUERY',
                dataType: 'jsonp',
                filter: function (data) {
                    var dataset = [];
                    _.each(data, function (item) {
                        dataset.push({
                            value: item.name,
                            label: item.name,
                            layer: 'Point of Interest',
                            lat: item.lat,
                            lng: item.lng
                        });
                    });
                    if (dataset.length === 0) { dataset.push({ value: "No records found." }); }
                    return _(dataset).sortBy("value");
                }
            },
            minLength: 4,
            limit: 15,
            header: '<h4 class="typeahead-header"><span class="glyphicon glyphicon-star"></span> Point of Interest</h4>'
        }, {
            name: 'business',
            remote: {
                url: 'http://maps.co.mecklenburg.nc.us/rest/v4/ws_geo_ubersearch.php?searchtypes=business&query=%QUERY',
                dataType: 'jsonp',
                filter: function (data) {
                    var dataset = [];
                    _.each(data, function (item) {
                        dataset.push({
                            value: item.name,
                            label: item.name,
                            layer: 'Point of Interest',
                            lat: item.lat,
                            lng: item.lng
                        });
                    });
                    if (dataset.length === 0) { dataset.push({ value: "No records found." }); }
                    return _(dataset).sortBy("value");
                }
            },
            minLength: 4,
            limit: 15,
            header: '<h4 class="typeahead-header"><span class="glyphicon glyphicon-briefcase"></span> Business</h4>'
        }
    ]).on('typeahead:selected', function (obj, datum) {
        //console.log(datum);

        $.ajax({
            url: 'http://maps.co.mecklenburg.nc.us/rest/v2/ws_geo_pointoverlay.php',
            type: 'GET',
            dataType: 'jsonp',
            data: {
                'x': datum.lng,
                'y': datum.lat,
                'srid': 4326,
                'table': 'neighborhoods',
                'fields': 'id'
            },
            success: function (data) {
                var sel = d3.select(".geom path[data-id='" + data[0].id + "']");
                PubSub.publish('geocode', {
                    "id": data[0].id,
                    "value": sel.attr("data-value"),
                    "d3obj": sel,
                    "lat": datum.lat,
                    "lng": datum.lng
                });
            }
        });
    });
    $("#btn-search").bind("click", function (event) {
        $('.typeahead').focus();
    });


    // subscriptions
    PubSub.subscribe('initializeMap', processMetric);
    PubSub.subscribe('initializeMap', drawMap);
    PubSub.subscribe('initializeMap', updateMeta);
    PubSub.subscribe('initializeBarChart', drawBarChart);
    PubSub.subscribe('changeYear', drawMap);
    PubSub.subscribe('changeYear', drawBarChart);
    PubSub.subscribe('changeYear', updateChartMarkers);
    PubSub.subscribe('changeMetric', processMetric);
    PubSub.subscribe('changeMetric', drawMap);
    PubSub.subscribe('changeMetric', drawBarChart);
    PubSub.subscribe('changeMetric', updateChartMarkers);
    PubSub.subscribe('changeMetric', updateMeta);


    PubSub.subscribe('selectGeo', d3Select);

    PubSub.subscribe('geocode', d3Zoom);
    PubSub.subscribe('geocode', d3Select);
    PubSub.subscribe('geocode', addMarker);
    // PubSub.subscribe('selectGeo', d3BarchartSelect);
    // PubSub.subscribe('selectGeo', d3LinechartSelect);

    // set up map
    map = L.map("map", {
            zoomControl: true,
            attributionControl: false,
            scrollWheelZoom: true,
            zoomAnimation: false,
            minZoom: 9,
            maxZoom: 17
        }).setView([35.260, -80.827],10);

    L.Icon.Default.imagePath = "images/";

    // Mecklenburg Base Layer
    var baseTiles = L.tileLayer("http://maps.co.mecklenburg.nc.us/tiles/meckbase/{y}/{x}/{z}.png");

    // Year control
    var yearControl = L.control({position: 'bottomright'});
    yearControl.onAdd = function(map) {
        this._div = L.DomUtil.create('div', 'yearDisplay');
        this._div.innerHTML = '<h3 class="time-year">2012</h3>';
        return this._div;
    };
    yearControl.addTo(map);

    // map typeahead
    // var mapsearch = L.control({position: 'topcenter'});
    // mapsearch.onAdd = function(map) {
    //     this._div = L.DomUtil.create('div', 'yearDisplay');
    //     this._div.innerHTML = '<h3 class="time-year">2012</h3>';
    //     return this._div;
    // };
    // mapsearch.addTo(map);

    // Layer control
    // L.control.layers( {} , {"Base Map": baseTiles}).addTo(map);
    // map.on('overlayadd',function(e){
    //     // test for e.name === "Base Map"
    //     $(".neighborhoods path").css("opacity", "0.6");

    // });
    // map.on('overlayremove',function(e){
    //     $(".neighborhoods path").css("opacity", "1");
    // });

    map.on("zoomend", function() {
        if (map.getZoom() >= 15) {
            $(".geom path").css("fill-opacity", "0.5");
            map.addLayer(baseTiles);
        } else {
            $(".geom path").css("fill-opacity", "1");
            map.removeLayer(baseTiles);
        }
    });


    queue()
        .defer(d3.json, "data/npa.topo.json")
        .defer(d3.csv, "data/metric/" + $("#metric").val() + ".csv")
        .await(draw);


    d3.select(window).on("resize", function () {
        if ($(".barchart").parent().width() !== barchartWidth) {
            drawBarChart();
            //drawLineChart();
        }
    });


});

function draw(error, geom, data) {
    PubSub.publish('initializeMap', {
        "geom": geom,
        "metricdata": data,
        'metric': $("#metric").val()
    });
    PubSub.publish('initializeBarChart', {
        "metricdata": data,
        "metric": $("#metric").val()
    });
}

function changeMetric(error, data) {
    $(".d3-tip").remove();
    PubSub.publish('changeMetric', {
        'metricdata': data,
        'metric': $("#metric").val()
    });
}

function updateMeta(msg, d) {
    $.ajax({
        url: 'data/meta/' + d.metric + '.md',
        type: 'GET',
        dataType: 'text',
        success: function (data) {
            var converter = new Markdown.Converter();
            var html = converter.makeHtml(data);
            var parsedhtml = $('<div/>').append(html);
            $('.meta-resources ul').html(parsedhtml.find("ul").html());
            $('.meta-subtitle').html(parsedhtml.find("p:eq(0)").html());
            $('.meta-important').html(parsedhtml.find("p:eq(1)").html());
            $('.meta-about').html("<p>" + parsedhtml.find("p:eq(2)").html() + "</p>");
            $('.meta-about').append("<p>" + parsedhtml.find("p:eq(3)").html() + "</p>");
        },
        error: function (error, status, desc) {
            console.log(status, desc);
        }
    });
}

function processMetric(msg, data) {
    // clear metric data
    metricData.length = 0;

    var keys = Object.keys(data.metricdata[0]);
    for (var i = 1; i < keys.length; i++) {
        metricData.push({"year": keys[i], "map": d3.map()});
    }

    // set slider
    year = metricData.length -1;
    $(".slider").slider("option", "max", year).slider("value", year);
    metricData.length > 1 ? $(".year-slider").fadeIn() : $(".year-slider").hide();
    $('.time-year').text(metricData[metricData.length - 1].year.replace("y_", ""));


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
        .range(d3.range(7).map(function (i) {
            return "q" + i;
        }));
}



function dataPretty(theMetric, theValue) {
    var m = _.filter(dataMeta, function (d) { return d.id === theMetric; });
    var fmat = d3.format("0,000.0");
    if (m.length === 1) {
        if (m[0].units === "percent") {
            return fmat(theValue) + "%";
        }
        else if (m[0].units === "year") {
            return theValue;
        }
        else {
            return fmat(theValue) + " " + m[0].units;
        }
    }
    else {
        return fmat(theValue);
    }
}
