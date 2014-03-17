var map,                // leaflet map
    quantize,           // d3 quantizer for color breaks
    x_extent,           // extent of the metric, including all years
    metricData = [],    // each element is object {'year': the year, 'map': d3 map of data}
    timer,              // timer for year slider
    year,               // the currently selected year as array index of metricData
    barchartWidth,      // for responsive charts
    marker,             // marker for geocode
    colorbreaks = 7,     // the number of color breaks
    trendChart,
    valueChart,
    d3Layer;

PubSub.immediateExceptions = true; // set to false in production

String.prototype.commafy = function () {
    return this.replace(/(^|[^\w.])(\d{4,})/g, function($0, $1, $2) {
        return $1 + $2.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,");
    });
};
Number.prototype.commafy = function () {
    return String(this).commafy();
};

function getNearestNumber(a, n){
    if((l = a.length) < 2) {
        return l - 1;
    }
    for(var l, p = Math.abs(a[--l] - n); l--;) {
        if(p < (p = Math.abs(a[l] - n))) {
            break;
        }
    }
    return l + 1;
}

// Slider change event
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

    // Start with random metric if none passed
    if (getURLParameter("m") !== "null") {
        $("#metric option[value='" + getURLParameter('m') + "']").prop('selected', true);
    }
    else {
        var $options = $('.chosen-select').find('option'),
            random = Math.floor((Math.random() * $options.length));
        $options.eq(random).prop('selected', true);
    }

    // chosen
    $(".chosen-select").chosen({width: '100%', no_results_text: "Not found - "}).change(function () {
        var theVal = $(this).val();
        d3.json("data/metric/" + theVal + ".json", changeMetric);
        $(this).trigger("chosen:updated");
    });

    // joyride
    $('.btn-help').on("click", function() {
        $('.leaflet-control-zoom').hide();
        $("#tutorial").joyride({
            postRideCallback: function() { $('.leaflet-control-zoom').show(); }
        });
    });

    // clear selection button
    $(".select-clear").on("click", function() {
        d3.selectAll(".geom path").classed("d3-select", false);
        d3.select(".value-select").selectAll("rect, line, text, circle").remove();
        d3.selectAll(".trend-select").selectAll("path, circle").remove();
        try { map.removeLayer(marker); }
        catch (err) {}
    });

    // Track outbound resource links
    $(".meta-resources").on("click", "a", function(){
        if (window.ga) {
            ga('send', 'event', 'resource', $("#metric option:selected").text().trim(), $(this).prop("href"));
        }
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

    // subscriptions
    PubSub.subscribe('initialize', processMetric);
    PubSub.subscribe('initialize', drawMap);
    PubSub.subscribe('initialize', updateMeta);
    PubSub.subscribe('initialize', drawBarChart);
    PubSub.subscribe('initialize', drawLineChart);
    PubSub.subscribe('initialize', initTypeahead);
    PubSub.subscribe('changeYear', drawMap);
    PubSub.subscribe('changeYear', drawBarChart);
    PubSub.subscribe('changeMetric', processMetric);
    PubSub.subscribe('changeMetric', drawMap);
    PubSub.subscribe('changeMetric', drawBarChart);
    PubSub.subscribe('changeMetric', drawLineChart);
    PubSub.subscribe('changeMetric', updateMeta);
    PubSub.subscribe('selectGeo', d3Select);
    PubSub.subscribe('geocode', d3Zoom);
    PubSub.subscribe('geocode', d3Select);
    PubSub.subscribe('geocode', addMarker);
    PubSub.subscribe('findNeighborhood', d3Select);
    PubSub.subscribe('findNeighborhood', d3Zoom);

    // set up map
    L.Icon.Default.imagePath = './images';
    map = L.map("map", {
            attributionControl: false,
            touchZoom: true,
            minZoom: 9,
            maxZoom: 17
        }).setView([35.260, -80.827], 10);
    var baseTiles = L.tileLayer("http://mcmap.org:3000/meckbase/{z}/{x}/{y}.png");

    // Year control
    var yearControl = L.control({position: 'bottomright'});
    yearControl.onAdd = function(map) {
        this._div = L.DomUtil.create('div', 'yearDisplay');
        this._div.innerHTML = '<h3 class="time-year">2012</h3>';
        return this._div;
    };
    yearControl.addTo(map);

    // Only show map when zoomed in
    map.on("zoomend", function() {
        if (map.getZoom() >= 15) {
            $(".geom path").css("fill-opacity", "0.5");
            map.addLayer(baseTiles);
        } else {
            $(".geom path").css("fill-opacity", "0.8");
            map.removeLayer(baseTiles);
        }
    });

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

    // jquery promise so we get geometry and data before anything goes
    $.when(
        $.getJSON("data/npa.topo.json"),
        $.getJSON("data/metric/" + $("#metric").val() + ".json")
    ).then(function(geom, data) {
        draw(geom[0], data[0]);
    });

    // window resize so charts change
    d3.select(window).on("resize", function () {
        if ($(".barchart").parent().width() !== barchartWidth) {
            drawBarChart();
            drawLineChart();
        }
    });


});

function draw(geom, data) {
    PubSub.publish('initialize', {
        "geom": geom,
        "metricdata": data,
        'metric': $("#metric").val()
    });
}

function changeMetric(error, data) {
    $(".d3-tip").remove();
    PubSub.publish('changeMetric', {
        'metricdata': data,
        'metric': $("#metric").val()
    });
}

function GetSubstringIndex(str, substring, n) {
    var times = 0, index = null;
    while (times < n && index !== -1) {
        index = str.indexOf(substring, index+1);
        times++;
    }
    return index;
}

// Eyes wide open for this giant hack. I'm reading the metric HTML (converted from
// markdown in build process) and pulling substrings out to place on the page. If your
// metric meta is different *at all*, and it will be, you will need to edit here.
function updateMeta(msg, d) {
    $.ajax({
        url: 'data/meta/' + d.metric + '.html',
        type: 'GET',
        dataType: 'text',
        success: function (data) {
            $('.meta-subtitle').html(
                data.substring(GetSubstringIndex(data, '</h2>', 1) + 5, GetSubstringIndex(data, '<h3', 1))
            );
            $('.meta-important').html(
                data.substring(GetSubstringIndex(data, '</h3>', 1) + 5, GetSubstringIndex(data, '<h3', 2))
            );
            $('.meta-about').html(
                data.substring(GetSubstringIndex(data, '</h3>', 2) + 5, GetSubstringIndex(data, '<h3', 3))
            );
            $('.meta-resources').html(
                data.substring(GetSubstringIndex(data, '</h3>', 3) + 5, data.length)
            );
        },
        error: function (error, status, desc) {
            console.log(status, desc);
        }
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

    // set slider and time related stuff
    if (!_.isNumber(year)) {
        year = metricData.length -1;
    } else {
        var newYears = _.map(_.pluck(metricData, 'year'), function(d) { return parseInt(d.replace("y_", "")); });
        year = getNearestNumber(newYears, prevYear);
    }
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
        .range(d3.range(7).map(function (i) {
            return "q" + i;
        }));

    // push metric to GA and state
    // Note I'm doing the text descript, not the little name, for clarity in analytics
    if (msg !== 'initialize') {
        if (history.pushState) {
            history.pushState({myTag: true}, null, "?m=" + $("#metric").val());
        }
        if (window.ga) {
            theMetric = $("#metric option:selected");
            ga('send', 'event', 'metric', theMetric.parent().prop("label"), theMetric.text().trim());
        }
    }
}
