// All Hail Ye Report
//
// The idea was this would be a print page, because try as I might I can't convince
// people that burning your screen into pressed tree pulp in 2014 is a bad idea.
// But I figured if I could format it well for printing and display so it could be a
// "nice feature".
//
// Because there isn't interactivity and I need all of the data, I'm loading the full
// montey and not doing any fancy PubSub or other design patterns.
//
// Also, because it's very printer/designer-y, it's mostly hard coded to our data.
// Sorry - I can't figure out a generic way to do what we wanted. Still, it isn't
// hard. Directions to come here.
//
// Imagine my face while coding up a print page.

// script for getting crap out of the select box for the page tables
// run this in your browser's JS console
// var text = "";
// $("optgroup[label='Economics'] option").each(function() {
//     var label = $(this).prop("label");
// 	var m = $(this).val();
// 	text += "<tr><td class='" + m + "-label'>" + label + "</td><td class='text-right' data-metric='" + m + "'></td><td class='text-right' data-change='" + m + "'></td><td class='text-right' data-average='" + m + "'></td></tr>";
// });
// console.log(text);


var theFilter = ["434","372","232"],    // default list of neighborhoods if none passed
    theData;                            // global for fetched raw data

// Here we make our snazzy chartjs charts. Each chart type has it's own code
// block. The chart's data-chart property stores the metrics each chart needs.
function createCharts() {
    var colors = ["#F7464A", "#E2EAE9", "#D4CCC5", "#949FB1"];

    // doughnut charts
    $(".chart-doughnut").each(function() {
        // prep the data
        var data = [],
            title = $(this).data('labels').split(',');

        _.each($(this).data('chart').split(','), function(el, i) {
            var theMean = mean(_.filter(theData[el], function(d) { return theFilter.indexOf(d.id.toString()) !== -1; })),
                keys = Object.keys(theMean);

            data.push({
                value: Number(theMean[keys[keys.length - 1]]),
                color: colors[i],
                label: title[i]
            });
        });

        ctx = document.getElementById($(this).prop("id")).getContext("2d");
        var chart = new Chart(ctx).Doughnut(data, {
            //String - A legend template
    legendTemplate : '<% for (var i=0; i<segments.length; i++){%><span style="border-color:<%=segments[i].fillColor%>" class="title"><%if(segments[i].label){%><%=segments[i].label%><%}%></span><%}%>'
        });

        $("#" + $(this).prop("id") + "-legend").html(chart.generateLegend());

    });

    // bar charts
    $(".chart-bar").each(function() {
        // prep the data
        var data = {};

        datasets = [
            {
                fillColor: "rgba(151,187,205,0.5)",
                strokeColor: "rgba(151,187,205,0.8)",
                data: [],
                label: "NPA"
            },
            {
                fillColor: "rgba(220,220,220,0.5)",
                strokeColor: "rgba(220,220,220,0.8)",
                data: [],
                label: "County"
            }
        ];

        data.labels = $(this).data('labels').split(",");

        _.each($(this).data('chart').split(','), function(el) {
            var npaMean = mean(_.filter(theData[el], function(d) { return theFilter.indexOf(d.id.toString()) !== -1; })),
                countyMean = mean(theData[el]),
                keys = Object.keys(npaMean);
            datasets[0].data.push(npaMean[keys[keys.length - 1]]);
            datasets[1].data.push(countyMean[keys[keys.length - 1]]);
        });

        data.datasets = datasets;

        ctx = document.getElementById($(this).prop("id")).getContext("2d");
        var chart = new Chart(ctx).Bar(data, {
            legendTemplate : '<% for (var i=0; i<datasets.length; i++){%><span class="title"  style="border-color:<%=datasets[i].strokeColor%>"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></span><%}%>'
        });

        $("#" + $(this).prop("id") + "-legend").html(chart.generateLegend());

    });

    // line charts
    $(".chart-line").each(function() {
        var metric = $(this).data("chart"),
            npaMean = mean(_.filter(theData[metric], function(el) { return theFilter.indexOf(el.id.toString()) !== -1; })),
            countyMean = mean(theData[metric]),
            keys = Object.keys(theData[metric][0]);

        var data = {
            labels: [],
            datasets: [
                {
                    fillColor: "rgba(151,187,205,0.2)",
                    strokeColor: "rgba(151,187,205,1)",
                    pointColor: "rgba(151,187,205,1)",
                    pointStrokeColor: "#fff",
                    data: [],
                    label: "NPA"
                },
                {
                    fillColor: "rgba(220,220,220,0.2)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointColor: "rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    data: [],
                    label: "County"
                }
            ]
        };

        _.each(keys, function(el, i) {
            if (i > 0) {
                data.labels.push(el.replace("y_", ""));
                data.datasets[1].data.push(countyMean[el]);
                data.datasets[0].data.push(npaMean[el]);
            }
        });


        ctx = document.getElementById($(this).prop("id")).getContext("2d");
        var chart = new Chart(ctx).Line(data, {
            legendTemplate : '<% for (var i=0; i<datasets.length; i++){%><span class="title"  style="border-color:<%=datasets[i].strokeColor%>"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></span><%}%>'
        });

        if ($("#" + $(this).prop("id") + "-legend").length > 0) {
            $("#" + $(this).prop("id") + "-legend").html(chart.generateLegend());
        }
    });
}

// Here we dump numbers in tables and the blocks on the first page.
function createData() {
    // metrics
    $("[data-metric]").each(function() {
        var el = $(this),
            theMean = mean(_.filter(theData[el.data("metric")], function(d) { return theFilter.indexOf(d.id.toString()) !== -1; })),
            keys = Object.keys(theMean);

        el.html(dataPretty(theMean[keys[keys.length -1]], el.data("metric")));
    });

    // diffs
    $("[data-change]").each(function() {
        var el = $(this),
            theMean = mean(_.filter(theData[el.data("change")], function(d) { return theFilter.indexOf(d.id.toString()) !== -1; })),
            keys = Object.keys(theMean),
            theDiff = ((theMean[keys[keys.length - 1]] - theMean[keys[0]]) / theMean[keys[0]]) * 100;

        if (theDiff === 0 || !$.isNumeric(theDiff)) {
            theDiff = "--";
        } else if (theDiff > 0)
            theDiff = "<span class='glyphicon glyphicon-arrow-up'></span> +" + theDiff.toFixed(1) + "%";
        else {
            theDiff = "<span class='glyphicon glyphicon-arrow-down'></span> -" + (theDiff * -1).toFixed(1) + "%";
        }

        el.html(theDiff);
    });

    // county averages
    $("[data-average]").each(function() {
        var el = $(this),
            theMean = mean(theData[el.data("average")]),
            keys = Object.keys(theMean);
        el.html(dataPretty(theMean[keys[keys.length - 1]], el.data("average")));
    });
}


// Nothing fancy here. We're making a small Leaflet map, adding just the neighborhoods
// that we're reporting on, and zooming to them. I'm adding labels to the neighborhoods
// via leaflet.label.
function createMap(data){
    // set up map
    L.Icon.Default.imagePath = './images';
    var map = L.map("map", {
            attributionControl: false,
            zoomControl: false,
            touchZoom: false,
            minZoom: mapGeography.minZoom,
            maxZoom: mapGeography.maxZoom
        });

    // Disable drag and zoom handlers.
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();

    // add data filtering by passed neighborhood id's
    var geom = L.geoJson(topojson.feature(data, data.objects[neighborhoods]), {
        style: {
            "color": "#FFA400",
            "fillColor": "rgba(0,0,0,0)",
            "weight": 2,
            "opacity": 1
        },
        filter: function(feature, layer) {
            return theFilter.indexOf(feature.id.toString()) != -1;
        },
        onEachFeature: function(feature, layer) {
            var pt = L.geoJson(feature).getBounds().getCenter();
            label = new L.Label();
            label.setContent(feature.id.toString());
            label.setLatLng(pt);
            map.showLabel(label);
        }
    }).addTo(map);

    // zoom to data
    map.fitBounds(geom.getBounds());

    // add base tiles at the end so no extra image grabs
    L.tileLayer(baseTilesURL).addTo(map);
}


// Do all the things
$(document).ready(function() {

    // ye customizable subtitle
    $(".subtitle").on("click", function() { $(this).select(); });

    // grab the neighborhood list from the URL to set the filter
    if (getURLParameter("n") !== "null") {
        theFilter.length = 0;
        _.each(getURLParameter("n").split(","), function (n) {
            theFilter.push(n);
        });
    }

    // populate the neighborhoods list on the first page
    $(".neighborhoods").text("NPA " + theFilter.join(", "));

    // fetch map data and make map
    $.get("data/geography.topo.json", function(data) {
        createMap(data);
    });

    // fetch the metrics and make numbers and charts
    $.get("data/merge.json", function(data) {
        theData = data;
        createData();
        createCharts();
    });

});
