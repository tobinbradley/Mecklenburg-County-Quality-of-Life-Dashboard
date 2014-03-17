// Prototype for moving svg element to the front
// Useful so highlighted or selected element border goes on top
d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};

function quantizeCount(data) {
    var q1 = _.countBy(data, function (d) {
        return quantize(d);
    });
    var q2 = [];
    for (var i = 0; i <= colorbreaks - 1; i++) {
        if (!q1["q" + i]) { q1["q" + i] = 0; }
        q2.push({
            "key": "q" + i,
            "value": q1["q" + i]
        });
    }
    return q2;
}

function d3Select(msg, d) {
    if (d.d3obj.classed("d3-select") && msg !== "geocode") {
        d.d3obj.classed("d3-select", false);

        // remove chart shit
        trendChart.lineRemove(d.d3obj.attr("data-id"), ".trend-select");
        valueChart.pointerRemove(d.d3obj.attr("data-id"), ".value-select");
    }
    else {
        d.d3obj.classed("d3-select", true);
        if ($.isNumeric(d.d3obj.attr("data-value"))) {
            // add to chart
            trendChart.lineAdd(".trend-select", d.d3obj.attr("data-id"));
            valueChart.pointerAdd(d.d3obj.attr("data-id"), d.d3obj.attr("data-value"), ".value-select");
        }
    }
}

function d3Zoom(msg, d) {
    if ($(".geom path.d3-select").length === 0 || msg === "geocode" || msg === "findNeighborhood") {
        var feature = _.filter(d3Layer.toGeoJSON().features, function(data) { return data.id === d.id; });
        map.fitBounds(L.geoJson(feature[0]).getBounds());
    }
}

// Add marker
function addMarker(msg, d) {
    // remove old markers
    try { map.removeLayer(marker); }
    catch (err) {}

    // add new marker
    marker = L.marker([d.lat, d.lng]).addTo(map);
    //map.panTo([d.lat, d.lng]);
}


// format data
function dataPretty(theValue) {
    var theMetric = $("#metric").val(),
        fmat = d3.format("0,000.0"),
        prefix = "",
        suffix = "",
        pretty = "",
        pct = [],
        money = [],
        year = [];

    pct = ["m4", "m6", "m7", "m8", "m9", "m10", "m11", "m12", "m13", "m18", "m19", "m20", "m21", "m32", "m33", "m34", "m35", "m36", "m37", "m38", "m39", "m40", "m41", "m42", "m43", "m44", "m45", "m47", "m48", "m49", "m50", "m58", "m59", "m60", "m61", "m62", "m66", "m67", "m68", "m71", "m73", "m75", "m76", "m77", "m78", "m80"];
    money = ["m17","m57","m63"];
    year = ["m24", "m53"];

    pretty = parseFloat(parseFloat(theValue).toFixed(1)).toString().commafy();
    if (pct.indexOf(theMetric) !== -1) { suffix = "%"; }
    if (money.indexOf(theMetric) !== -1) {
        prefix = "$";
        pretty = parseFloat(theValue).toFixed(0).commafy();
    }
    if(year.indexOf(theMetric) !== -1) {
        pretty = parseFloat(pretty.replace(",", "")).toFixed(0);
    }

    return prefix + pretty + suffix;
}


