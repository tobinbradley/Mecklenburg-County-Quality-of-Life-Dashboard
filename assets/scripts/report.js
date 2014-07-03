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
// Still, imagine my face while coding up a print page.

// script for getting crap out of the select box
// var text = "";
// $("optgroup[label='Character'] option").each(function() {
//     var label = $(this).prop("label");
// 	var m = $(this).val();
// 	text += "<tr><td>" + label + "</td><td data-metric='" + m + "'></td><td data-change='" + m + "'></td><td data-average='" + m + "'></td></tr>";
// });
// console.log(text);

var theFilter = ["434","372","232"],
    theData,
    computedData = {};

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



function createCharts(data) {
    data = [
        {
            value: 30,
            color:"#F7464A",
            title: 'Lions'
        },
        {
            value : 50,
            color : "#E2EAE9",
            title: 'Tigers'
        },
        {
            value : 100,
            color : "#D4CCC5",
            title: 'Bears'
        },
        {
            value : 40,
            color : "#949FB1",
            title: 'Flying Monkees'
        }
    ];

    // doughnut charts
    $(".chart-doughnut").each(function() {
        // prep the data
        ctx = document.getElementById($(this).prop("id")).getContext("2d");
        new Chart(ctx).Doughnut(data);
        legend(document.getElementById($(this).prop("id") + "-legend"), data);
    });
}


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
// that we're reporting on, and zooming to them.
function createMap(data){
    // set up map
    L.Icon.Default.imagePath = './images';
    var map = L.map("map", {
            attributionControl: false,
            zoomControl: false,
            touchZoom: true,
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
        }
    }).addTo(map);

    // zoom to data
    map.fitBounds(d3Layer.getBounds());

    // add base tiles at the end so no extra image grabs
    L.tileLayer(baseTilesURL).addTo(map);
}


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
        createCharts(data);
    });

});
