// All Hail Ye Report
//
// The idea was this would be a print page, because try as I might I can't convince
// people that burning your screen into pressed tree pulp in 2014 is a bad idea.
// But I figured I could format it well for printing and display so it could be a
// "nice feature".
//
// Because it's very printer/designer-y, it's mostly hard coded to our data.
// Sorry - I can't figure out a generic way to do what we wanted.
//
// Imagine my face while coding up a print page. IMAGINE MY FACE.



// ****************************************
// Globals
// ****************************************
var theFilter = ["434","372","232"],        // default list of neighborhoods if none passed
    theData,                                // global for fetched raw data
    model = {};

_.templateSettings.variable = "rc";


// ****************************************
// get the year(s) for each metric
// ****************************************
function getYear(m) {
    switch(metricConfig[m].type) {
        case 'sum': case 'normalize':
            return _.without(_.keys(theData['r' + metricConfig[m].metric][0]), 'id');
            break;
        case 'mean':
            return _.without(_.keys(theData['n' + metricConfig[m].metric][0]), 'id');
            break;
    }
}

// ****************************************
// set model variable as needed from data type
// ****************************************
function setModel(m) {
    model.metricId = m;
    switch(metricConfig[m].type) {
        case 'sum':
            model.metric = theData['r' + metricConfig[m].metric];
            break;
        case 'mean':
            model.metric = theData['n' + metricConfig[m].metric];
            if (metricConfig[m].raw_label) {
                model.metricRaw = theData['r' + metricConfig[m].metric];
            }
            break;
        case 'normalize':
            model.metricRaw = theData['r' + metricConfig[m].metric];
            model.metricDenominator = theData['d' + metricConfig[m].metric];
            var keys = _.without(_.keys(model.metricRaw[0]), "id");
            break;
    }
}


// ****************************************
// Create charts
// ****************************************
function createCharts() {
    var colors = ["#5C2B2D", "#7A9993", "#959BA9", "#FAFBDD", "#C3DBDE"];

    // doughnut charts
    $(".chart-doughnut").each(function() {
        var data = [];
        var selector = $(this).data("selector");
        _.each($(this).data('chart').split(','), function(el, i) {
            dataTypeKey = el;
            data.push({
                value: Number($(".data-" + el).data(selector)),
                color: colors[i],
                label: $(".label-" + el).data("val").replace('Race/Ethnicity - ', '')
            });
        });
        ctx = document.getElementById($(this).prop("id")).getContext("2d");
        var chart = new Chart(ctx).Doughnut(data, {
            showTooltips: true,
            legendTemplate : '<% for (var i=0; i<segments.length; i++){%><span style="border-color:<%=segments[i].fillColor%>" class="title"><%if(segments[i].label){%><%=segments[i].label%><%}%></span><%}%>',
            tooltipTemplate: "<%= dataPretty(value, '" + dataTypeKey + "') %>",
            multiTooltipTemplate: "<%= dataPretty(value, '" + dataTypeKey + "') %>",
        });
        var legend = document.getElementById($(this).prop("id") + "-legend");
        if (legend) { legend.innerHTML = chart.generateLegend(); }
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
                highlightFill: "rgba(151,187,205,0.75)",
                highlightStroke: "rgba(151,187,205,1)",
                data: [],
                label: "Selected " + neighborhoodDescriptor + "s"
            },
            {
                fillColor: "rgba(220,220,220,0.5)",
                strokeColor: "rgba(220,220,220,0.8)",
                highlightFill: "rgba(220,220,220,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
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

        data.datasets = datasets;

        ctx = document.getElementById($(this).prop("id")).getContext("2d");
        var chart = new Chart(ctx).Bar(data, {
            showTooltips: true,
            legendTemplate : '<% for (var i=0; i<datasets.length; i++){%><span class="title"  style="border-color:<%=datasets[i].strokeColor%>"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></span><%}%>',
            scaleLabel: "<%= dataFormat(dataRound(Number(value), 2), '" + dataTypeKey + "') %>",
            tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= dataPretty(value, '" + dataTypeKey + "') %>",
            multiTooltipTemplate: "<%= dataPretty(value, '" + dataTypeKey + "') %>",
        });

        var legend = document.getElementById($(this).prop("id") + "-legend");
        if (legend) { legend.innerHTML = chart.generateLegend(); }

    });

    // line charts
    $(".chart-line").each(function() {
        var m = $(this).data("chart"),
            npaMean = [],
            countyMean = [];

        setModel(m);
        keys = getYear(m);

        // stats
        _.each(keys, function(year) {
            countyMean.push(dataCrunch(metricConfig[m].type, year));
            npaMean.push(dataCrunch(metricConfig[m].type, year, theFilter));
            dataTypeKey = m;
        });

        // make sure selected stuff really has a value
        _.each(npaMean, function(el) {
            if (!$.isNumeric(el)) {
                npaMean = null;
            }
        });

        var data = {
            labels: [],
            datasets: [
                {
                    fillColor: "rgba(151,187,205,0.2)",
                    strokeColor: "rgba(151,187,205,1)",
                    pointColor: "rgba(151,187,205,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(151,187,205,1)",
                    data: [],
                    label: "Selected " + neighborhoodDescriptor + "s"
                },
                {
                    fillColor: "rgba(220,220,220,0.2)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointColor: "rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: [],
                    label: "County"
                }
            ]
        };

        _.each(countyMean, function(el, i) {
            data.labels.push(keys[i].replace("y_", ""));
            if (npaMean !== null) { data.datasets[0].data.push(Math.round(npaMean[i] * 10) / 10); }
            data.datasets[1].data.push(Math.round(el * 10) / 10);
        });

        // remove select mean if no values are there
        if (!npaMean || npaMean === null) { data.datasets.shift(); }

        ctx = document.getElementById($(this).prop("id")).getContext("2d");
        var chart = new Chart(ctx).Line(data, {
            showTooltips: true,
            legendTemplate : '<% for (var i=0; i<datasets.length; i++){%><span class="title"  style="border-color:<%=datasets[i].strokeColor%>"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></span><%}%>',
            scaleLabel: "<%= dataFormat(dataRound(Number(value), 2), '" + m + "') %>",
            tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= dataPretty(value, '" + dataTypeKey + "') %>",
            multiTooltipTemplate: "<%= dataPretty(value, '" + dataTypeKey + "') %>",
        });

        var legend = document.getElementById($(this).prop("id") + "-legend");
        if (legend) { legend.innerHTML = chart.generateLegend(); }

    });
}


// ****************************************
// Create the metric blocks and table values
// ****************************************
function createData() {
    var template = _.template(document.querySelector('.template-row').innerHTML),
        categories = _.uniq(_.pluck(metricConfig, 'category'));

    _.each(categories, function(dim) {
        var theTable = $(".table-" + dim.toLowerCase().replace(/\s+/g, "-") + " tbody");
        var theMetrics = _.filter(metricConfig, function(el) { return el.category.toLowerCase() === dim.toLowerCase(); });

        _.each(theMetrics, function(val) {
                var m = 'm' + val.metric;
                setModel(m);

                var tdata = {
                    "id": m,
                    "year": "",
                    "selectedVal": "",
                    "selectedRaw": "",
                    "selectedNVal": "",
                    "countyVal": "",
                    "countyRaw": "",
                    "countyNVal": ""
                };

                var keys = getYear(m);

                // year
                var year = keys[keys.length - 1];
                tdata.year = year.replace('y_', '');

                // Stats
                tdata.countyNVal = dataCrunch(metricConfig[m].type, year);
                tdata.countyVal = dataPretty(tdata.countyNVal, m);
                tdata.selectedNVal = dataCrunch(metricConfig[m].type, year, theFilter);
                tdata.selectedVal = dataPretty(tdata.selectedNVal, m);
                if (metricConfig[m].raw_label) {
                    tdata.countyRaw = '<br>' + dataSum(model.metricRaw, year).toFixed(0).commafy();
                    theStat = dataSum(model.metricRaw, year, theFilter);
                    if ($.isNumeric(theStat)) { theStat = theStat.toFixed(0).commafy(); }
                    tdata.selectedRaw = '<br>' + theStat;
                }

                // front page
                if ($('[data-metric="' + m + '"]').length > 0) {
                    $('[data-metric="' + m + '"]').text(tdata.selectedVal);
                }
                if ($('[data-metric="r' + val.metric + '"]').length > 0) {
                    $('[data-metric="r' + val.metric + '"]').text(tdata.selectedRaw.replace('<br>', ''));
                }

                // Write out stuff
                theTable.append(template(tdata));

        });

    });
}


// ****************************************
// Initialize the map
// Neighborhoods labled with leaflet.label
// ****************************************
function createMap(data){
    // set up map
    L.Icon.Default.imagePath = './images';
    var smallMap = L.map("smallmap", {
            attributionControl: false,
            zoomControl: false,
            touchZoom: false
        }).setView(mapGeography.center, mapGeography.defaultZoom - 1);
    var largeMap = L.map("largemap", {
            attributionControl: false,
            zoomControl: false,
            touchZoom: false
        });

    // Disable drag and zoom handlers.
    smallMap.dragging.disable();
    smallMap.touchZoom.disable();
    smallMap.doubleClickZoom.disable();
    smallMap.scrollWheelZoom.disable();
    largeMap.dragging.disable();
    largeMap.touchZoom.disable();
    largeMap.doubleClickZoom.disable();
    largeMap.scrollWheelZoom.disable();

    // add data filtering by passed neighborhood id's
    var geom = L.geoJson(topojson.feature(data, data.objects[neighborhoods]), {
        style: {
            "color": "#FFA400",
            "fillColor": "rgba(255,164,0,0.3)",
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
            largeMap.showLabel(label);
        }
    }).addTo(largeMap);

    geom = L.geoJson(topojson.feature(data, data.objects[neighborhoods]), {
        style: {
            "color": "#FFA400",
            "fillColor": "#FFA400",
            "weight": 2,
            "opacity": 1
        },
        filter: function(feature, layer) {
            return theFilter.indexOf(feature.id.toString()) !== -1;
        }
    }).addTo(smallMap);

    // zoom large map
    largeMap.fitBounds(geom.getBounds());

    // add base tiles at the end so no extra image grabs/FOUC
    L.tileLayer(baseTilesURL).addTo(largeMap);
    L.tileLayer(baseTilesURL).addTo(smallMap);
}


// ****************************************
// get pages in for data categories
// ****************************************
function pageTemplates() {
    var template = _.template(document.getElementById('template-category').innerHTML),
        categories = _.uniq(_.pluck(metricConfig, 'category')),
        pages = $(".category-pages");


    _.each(categories, function(el) {
        cat = el.toLowerCase();

        // get vis if available
        if ($("#template-vis-" + cat).length > 0) {
            vis = _.template(document.getElementById("template-vis-" + cat.replace(/\s+/g, "-")).innerHTML);
        } else {
            vis = "";
        }

        // drop in category page
        pages.append(template({ "vis": vis, "category": cat }));
    });
}

// ****************************************
// Document ready kickoff
// ****************************************
$(document).ready(function() {
    // scaffold in category pages
    pageTemplates();

    // ye customizable subtitle
    $(".subtitle").on("click", function() { $(this).select(); });

    // grab the neighborhood list from the URL to set the filter
    if (getURLParameter("n") !== "null") {
        theFilter = getURLParameter("n").split(",");
    }

    // populate the neighborhoods list on the first page
    // if too long to fit one one line it lists the number of neighborhoods instead
    var theNeighborhoods = theFilter.join(", ");
    if (theNeighborhoods.length > 85) {
        theNeighborhoods = theFilter.length;
        $(".neighborhoods").text(theNeighborhoods.commafy() + " " + neighborhoodDescriptor + "s");
    } else {
        $(".neighborhoods").text(neighborhoodDescriptor + ": " + theNeighborhoods.commafy());
    }

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
