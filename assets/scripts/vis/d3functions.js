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

function d3Highlight(vis, q, add) {
    var sel = d3.selectAll(vis + " ." + q);
    if (add === true) {
        sel.classed("d3-highlight", true);
        if (vis === ".geom") { sel.moveToFront(); }
    } else {
        sel.classed("d3-highlight", false);
    }
}

function d3Select(msg, d) {
    if (d.d3obj.classed("d3-select") && msg !== "geocode") {
        d.d3obj.classed("d3-select", false);
        // remove chart pointer
        d3.select(".mean-select .mean-triangle[data-id='" + d.d3obj.attr("data-id") + "']").remove();
        d3.selectAll(".trend-select circle[data-id='" + d.d3obj.attr("data-id") + "'], .trend-select path[data-id='" + d.d3obj.attr("data-id") + "']").remove();
    }
    else {
        d.d3obj.classed("d3-select", true);

        // add chart pointer
        var xScale = d3.scale.linear().domain(x_extent).range([0, $("#barChart").parent().width() - 60]);

        var y = d3.scale.linear().range([260, 0]).domain([0, 260]);
        var xVal = xScale(d.d3obj.attr("data-value"));

        // create county mean indicator
        barChart.select(".mean-select")
           .append("path")
           .attr("transform", "translate(" + xVal + "," + y(5) + ")")
           .attr("d", d3.svg.symbol().type("triangle-down").size(60))
           .attr("class", "mean-indicator mean-triangle")
           .attr("data-id", d.d3obj.attr("data-id"));

        // trend line
        trendChart.lineAdd(".trend-select", d.d3obj.attr("data-id"));

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

function updateChartMarkers(msg, d) {
    var xScale = d3.scale.linear().domain(x_extent).range([0, $("#barChart").parent().width() - 60]);
    var y = d3.scale.linear().range([260, 0]).domain([0, 260]);

    // update trend lines
    d3.selectAll(".trend-select circle, .trend-select path").remove();

    d3.selectAll(".geom path.d3-select").each(function () {
        var item = d3.select(this);
        var itemBarChart = d3.select(".mean-select .mean-triangle[data-id='" + item.attr("data-id") + "']");
        if (item.attr("data-value") === null) {
            itemBarChart.attr("opacity", "0");
        }
        else {
            var xVal = xScale(item.attr("data-value"));
            itemBarChart
                .transition()
                .duration(1400)
                .attr("opacity", "1")
                .attr("transform", "translate(" + xVal + "," + y(5) + ")");
        }

        // update trend lines
        if ($.isNumeric(item.attr("data-value"))) { trendChart.lineAdd(".trend-select", item.attr("data-id")); }

    });

}
