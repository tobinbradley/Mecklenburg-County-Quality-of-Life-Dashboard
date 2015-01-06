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
// hard. Directions to come (maybe).
//
// Imagine my face while coding up a print page.



// ****************************************
// Globals
// ****************************************
var theFilter = ["434","372","232"],   // default list of neighborhoods if none passed
    theData,                                // global for fetched raw data
    numDecimals,
    dimensions = ['character', 'economy', 'education', 'engagement', 'environment', 'health', 'housing', 'safety', 'transportation'];

_.templateSettings.variable = "rc";

// ****************************************
// Create the chart.js charts
// The container's data-labels and data-chart properties
// are used to customize the chart.
// ****************************************
function createCharts() {
    var colors = ["#5C2B2D", "#7A9993", "#959BA9", "#FAFBDD", "#C3DBDE"];

    // doughnut charts
    $(".chart-doughnut").each(function() {
        var data = [];
        var selector = $(this).data("selector");
        _.each($(this).data('chart').split(','), function(el, i) {

            data.push({
                value: Number($(".data-" + el).data(selector)),
                color: colors[i],
                label: $(".label-" + el).data("val").replace('Race/Ethnicity - ', '')
            });
        });
        ctx = document.getElementById($(this).prop("id")).getContext("2d");
        var chart = new Chart(ctx).Doughnut(data, {
            showTooltips: false,
            legendTemplate : '<% for (var i=0; i<segments.length; i++){%><span style="border-color:<%=segments[i].fillColor%>" class="title"><%if(segments[i].label){%><%=segments[i].label%><%}%></span><%}%>'
        });
        $("#" + $(this).prop("id") + "-legend").html(chart.generateLegend());
    });

    // bar charts
    $(".chart-bar").each(function() {
        // prep the data
        var data = {};
        var dataTypeKey = "";

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
            datasets[0].data.push($(".data-" + el).data("selected-val"));
            datasets[1].data.push($(".data-" + el).data("county-val"));
            dataTypeKey = el;
        });

        if (!$.isNumeric(datasets[0].data[0])) {
            datasets.shift();
        }

        data.datasets = datasets;

        ctx = document.getElementById($(this).prop("id")).getContext("2d");
        var chart = new Chart(ctx).Bar(data, {
            showTooltips: false,
            legendTemplate : '<% for (var i=0; i<datasets.length; i++){%><span class="title"  style="border-color:<%=datasets[i].strokeColor%>"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></span><%}%>',
            scaleLabel: "<%= dataFormat(dataRound(Number(value), 2), '" + dataTypeKey + "') %>"
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

        if (!$.isNumeric(data.datasets[0].data[0])) {
            data.datasets.shift();
        }

        ctx = document.getElementById($(this).prop("id")).getContext("2d");
        var chart = new Chart(ctx).Line(data, {
            showTooltips: false,
            legendTemplate : '<% for (var i=0; i<datasets.length; i++){%><span class="title"  style="border-color:<%=datasets[i].strokeColor%>"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></span><%}%>',
            scaleLabel: "<%= dataFormat(dataRound(Number(value), 2), '" + metric + "') %>"
        });

        if ($("#" + $(this).prop("id") + "-legend").length > 0) {
            $("#" + $(this).prop("id") + "-legend").html(chart.generateLegend());
        }
    });
}


// ****************************************
// Create the metric blocks and table values
// ****************************************
function createData() {
    var template = _.template($("script.template-row").html());

    _.each(dimensions, function(dim) {
        var theTable = $(".table-" + dim + " tbody");
        var theMetrics = _.filter(metricConfig, function(el) { return el.dimension.toLowerCase() === dim; });

        _.each(theMetrics, function(val) {
            if (theData[val.metric]) {
                var tdata = {
                    "id": val.metric,
                    "year": "",
                    "selectedVal": "",
                    "selectedRaw": "",
                    "countyVal": "",
                    "countyRaw": ""
                };

                var selectedRecords = _.filter(theData[val.metric], function(d) { return theFilter.indexOf(d.id.toString()) !== -1; });
                var selectedRaw = _.filter(theData[val.raw], function(d) { return theFilter.indexOf(d.id.toString()) !== -1; });
                var keys = Object.keys(theData[val.metric][0]);

                // name
                tdata.year = keys[keys.length -1].replace('y_', '');

                // selected value
                if (metricIsRaw.indexOf(val.metric) !== -1) {
                    tdata.selectedVal = sum(_.map(selectedRecords, function(num){ return num[keys[keys.length -1]]; }));
                } else {
                    theAgg = aggregateMean(selectedRecords, selectedRaw);
                    tdata.selectedVal = theAgg[keys[keys.length -1]];
                    if (metricConfig[val.metric].summable) {
                        tdata.selectedRaw = sum(_.map(selectedRaw, function(num){ return num[keys[keys.length -1]]; }));
                    }
                }


                // county value
                if (metricIsRaw.indexOf(val.metric) !== -1) {
                    tdata.countyVal = sum(_.map(theData[val.metric], function(num){ return num[keys[keys.length -1]]; }));
                } else {
                    theAgg = aggregateMean(theData[val.metric], theData[val.raw]);
                    tdata.countyVal = theAgg[keys[keys.length -1]];
                    if (metricConfig[val.metric].summable) {
                        tdata.countyRaw = sum(_.map(theData[val.raw], function(num){ return num[keys[keys.length -1]]; }));
                    }
                }

                // front page
                if ($('[data-metric="' + val.metric + '"]').length > 0) {
                    $('[data-metric="' + val.metric + '"]').text(dataPretty(tdata.countyVal, val.metric));
                }

                // units
                //tdata.units = val.label;

                // change
                // keys = Object.keys(theData[val.metric][0]);
                //
                // if (keys.length > 2) {
                //     theAgg = aggregateMean(selectedRecords, selectedRaw);
                //     theDiff = theAgg[keys[keys.length - 1]] - theAgg[keys[1]];
                //
                //     if (Number(theDiff.toFixed(1)) == 0) {
                //         theDiff = "↔ 0";
                //     } else if (theDiff > 0) {
                //         theDiff = "<span class='glyphicon glyphicon-arrow-up'></span> " + theDiff.toFixed(1);
                //     } else {
                //         theDiff = "<span class='glyphicon glyphicon-arrow-down'></span> " + (theDiff * -1).toFixed(1);
                //     }
                //
                //     tdata.change = theDiff;
                // }

                // Write out stuff
                theTable.append(template(tdata));

            }
        });

    });
}

function createBlocks() {
    $(".metric-box h3").each(function() {
        var m = $(this).data("metric");
        if (m.indexOf("r") !== -1) {
            var keys = Object.keys(theData[m][0]);
            var selectedRecords = _.filter(theData[m], function(d) { return theFilter.indexOf(d.id.toString()) !== -1; });
            var theVal = sum(_.map(selectedRecords, function(num){ return num[keys[keys.length -1]]; }));
            $(this).html(dataPretty(theVal, null));
        }
    });
}


// ****************************************
// Initialize the map
// Neighborhoods labled with leaflet.label
// ****************************************
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
            return theFilter.indexOf(feature.id.toString()) !== -1;
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


// ****************************************
// Document ready kickoff
// ****************************************
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
        createBlocks();
        createCharts();
    });

});
