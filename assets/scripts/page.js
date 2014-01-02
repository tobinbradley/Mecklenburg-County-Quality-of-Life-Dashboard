var map,
    quantize,
    x_extent,
    metricData = [],
    timer,
    year = 1,
    barchartWidth;

PubSub.immediateExceptions = true;

d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};

function sliderChange(value) {
    $('.time-year').text(metricData[value].year.replace("y_", ""));
    year = value;
    PubSub.publish('changeYear');
}

$(document).ready(function () {

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

    $(".chosen-select").chosen({no_results_text: "Oops, nothing found!"}).change(function () {
        var theVal = $(this).val();
        d3.csv("data/metric/" + theVal + ".csv", changeMetric);
        $(this).trigger("chosen:updated");
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
    PubSub.subscribe('initializeMap', processMetric);
    PubSub.subscribe('initializeMap', drawMap);
    PubSub.subscribe('initializeMap', updateMeta);
    PubSub.subscribe('initializeBarChart', drawBarChart);
    PubSub.subscribe('changeYear', drawMap);
    PubSub.subscribe('changeYear', drawBarChart);
    PubSub.subscribe('changeMetric', processMetric);
    PubSub.subscribe('changeMetric', drawMap);
    PubSub.subscribe('changeMetric', drawBarChart);
    PubSub.subscribe('changeMetric', updateMeta);

    // set up map
    map = L.map("map", {
            zoomControl: true,
            attributionControl: false,
            minZoom: 9,
            maxZoom: 16
        }).setView([35.260, -80.827],10);

    // Mecklenburg Base Layer
    var baseTiles = L.tileLayer("http://maps.co.mecklenburg.nc.us/tiles/meckbase/{y}/{x}/{z}.png");

    // Year
    var yearControl = L.control({position: 'bottomright'});
    yearControl.onAdd = function(map) {
        this._div = L.DomUtil.create('div', 'yearDisplay');
        this._div.innerHTML = '<h3 class="time-year">2012</h3>';
        return this._div;
    };
    yearControl.addTo(map);

    // Layer control
    L.control.layers( {} , {"Base Map": baseTiles}).addTo(map);
    map.on('overlayadd',function(e){
        // test for e.name === "Base Map"
        $(".neighborhoods path").css("opacity", "0.6");
    });
    map.on('overlayremove',function(e){
        $(".neighborhoods path").css("opacity", "1");
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

function draw(error, neighborhoods, data) {
    PubSub.publish('initializeMap', {
        "neighborhoods": neighborhoods,
        "metricdata": data,
        'metric': $("#metric").val()
    });
    PubSub.publish('initializeBarChart', {
        "metricdata": data,
        "metric": $("#metric").val()
    });
}

function changeMetric(error, data) {
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
        .range(d3.range(9).map(function (i) {
            return "q" + i;
        }));
}

function quantizeCount(data) {
    var q1 = _.countBy(data, function (d) {
        return quantize(d);
    });
    var q2 = [];
    for (var i = 0; i <= 8; i++) {
        if (!q1["q" + i]) { q1["q" + i] = 0; }
        q2.push({
            "key": "q" + i,
            "value": q1["q" + i]
        });
    }
    return q2;
}

function d3Highlight(vis, q, add) {
    var sel = d3.selectAll(vis + " ." + q + "-9");
    if (add === true) {
        sel.classed("d3-highlight", true);
        if (vis === ".neighborhoods") { sel.moveToFront(); }
    } else {
        sel.classed("d3-highlight", false);
    }
}

function dataPretty(theMetric, theValue) {
    var m = _.filter(dataMeta, (function (d) { return d.id === theMetric; }));
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

