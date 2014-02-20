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

        // trend line
        trendChart.lineAdd(".trend-select", d.d3obj.attr("data-id"));
        valueChart.pointerAdd(d.d3obj.attr("data-id"), d.d3obj.attr("data-value"), ".value-select");
    }
}

function d3Zoom(msg, d) {
    //var test = d3.select(".neighborhoods path[data-npa='2']").data()
    //var thebounds = d3.geo.bounds(test[0])
    if ($(".geom path.d3-select").length === 0 || msg === "geocode" || msg === "findNeighborhood") {
        var thebounds = d3.geo.bounds(d.d3obj.data()[0]);
        map.fitBounds([
            [thebounds[0][1], thebounds[0][0]],
            [thebounds[1][1], thebounds[1][0]]
        ]);
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


