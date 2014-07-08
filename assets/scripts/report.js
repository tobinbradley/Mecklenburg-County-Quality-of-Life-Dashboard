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

// script for getting crap out of the select box
// var text = "";
// $("optgroup[label='Economics'] option").each(function() {
//     var label = $(this).prop("label");
// 	var m = $(this).val();
// 	text += "<tr><td class='" + m + "-label'>" + label + "</td><td class='text-right' data-metric='" + m + "'></td><td class='text-right' data-change='" + m + "'></td><td class='text-right' data-average='" + m + "'></td></tr>";
// });
// console.log(text);


var theFilter = ["434","372","232"],    // default list of neighborhoods if none passed
    theData,                            // global for fetched raw data
    computedData = {};                  // global for computed data

// via http://bebraw.github.io/Chart.js.legend/
function legend(parent, data) {
    parent.className = 'legend';
    var datas = data.hasOwnProperty('datasets') ? data.datasets : data;

    // remove possible children of the parent
    while(parent.hasChildNodes()) {
        parent.removeChild(parent.lastChild);
    }

    datas.forEach(function(d) {
        var title = document.createElement('span');
        title.className = 'title';
        title.style.borderColor = d.hasOwnProperty('strokeColor') ? d.strokeColor : d.color;
        title.style.borderStyle = 'solid';
        parent.appendChild(title);

        var text = document.createTextNode(d.title);
        title.appendChild(text);
    });
}


// Here we're calculating stuff for our metrics.
// It gets stored in the computedData array for use in tables and charts.
// Note all of the if/thens. Ick.
function calcData(metric) {
    var result = {},
        vals = [],
        keys = Object.keys(theData[metric][0]),
        currentKey = keys[keys.length - 1],
        oldestKey = keys[1],
        count = 0,
        sum = 0,
        diff = 0;

    _.chain(theData[metric])
        .filter(function(el) {
            return theFilter.indexOf(el.id.toString()) !== -1;
        })
        .each(function(el){
            if ($.isNumeric(el[currentKey])) {
                count++;
                sum = sum + Number(el[currentKey]);
                diff = diff + Number(el[oldestKey]);
            }
        });


    if (count === 0) {
        result.mean = "N/A";
        result.diff = "N/A";
    }
    else {
        result.mean = dataPretty(sum / count, metric);
        if (diff === 0)  {
            result.diff = 0;
        } else {
            result.diff = (((sum / count) - (diff / count)) / (diff / count) * 100);
        }
        if (result.diff > 0) {
            result.diff = "<span class='glyphicon glyphicon-arrow-up'></span> " + result.diff.toFixed(1) + "%";
        } else if (result.diff < 0){
            result.diff = "<span class='glyphicon glyphicon-arrow-down'></span> " + result.diff.toFixed(1) + "%";
        } else {
            result.diff = "--";
        }
    }
    result.nmean = dataPretty(d3.mean(theData[metric], function(d) { return Number(d[currentKey]); }), metric);

    computedData[metric] = result;

}



// Here we make our snazzy chartjs charts. Each chart type has it's own code
// block. The chart's data-chart property stores the metrics each chart needs.
function createCharts() {
    var colors = ["#F7464A", "#E2EAE9", "#D4CCC5", "#949FB1"];

    // doughnut charts
    $(".chart-doughnut").each(function() {
        // prep the data
        var data = [];
        _.each($(this).data('chart').split(','), function(el, i) {
            data.push({
                value: Number(computedData[el].mean.replace(/[A-Za-z$-\,]/g, "")),
                color: colors[i],
                title: $("." + el + "-label").html()
            });
        });

        ctx = document.getElementById($(this).prop("id")).getContext("2d");
        new Chart(ctx).Doughnut(data);
        legend(document.getElementById($(this).prop("id") + "-legend"), data);
    });
}

// Here we dump numbers in charts and on the first page.
function createData() {
    // metrics
    $("[data-metric]").each(function() {
        var el = $(this);
        if (!computedData[el.data["metric"]]) { calcData(el.data("metric")); }
        el.html(computedData[el.data("metric")].mean);
    });

    // diffs
    $("[data-change]").each(function() {
        var el = $(this);
        el.html(computedData[el.data("change")].diff);
    });

    // averages
    $("[data-average]").each(function() {
        var el = $(this);
        el.html(computedData[el.data("average")].nmean);
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
    var d3Layer = L.geoJson(topojson.feature(data, data.objects[neighborhoods]), {
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
    map.fitBounds(d3Layer.getBounds());

    // add base tiles at the end so no extra image grabs
    L.tileLayer(baseTilesURL).addTo(map);
}


// Get the data and do all of the things
$(document).ready(function() {

    $(".subtitle").on("click", function() { $(this).select(); });

    // grab the neighborhood list from the URL
    if (getURLParameter("n") !== "null") {
        theFilter.length = 0;
        _.each(getURLParameter("n").split(","), function (n) {
            theFilter.push(n);
        });
    }
    $(".neighborhoods").text("NPA " + theFilter.join(", "));

    // fetch map data
    $.get("data/geography.topo.json", function(data) {
        createMap(data);
    });

    // fetch the metrics
    $.get("data/merge.json", function(data) {
        theData = data;
        createData();
        createCharts();
    });

});
