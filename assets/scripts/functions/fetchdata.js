function fetchGeometry() {
    if (typeof(d3Layer) == "undefined") {
        return $.get("data/geography.topo.json");
    }
    else { return [[]]; }
}
function fetchMetricData(m) {
    $.when(
        $.get("data/metric/" + m + ".json"),
        fetchGeometry()
    ).then(function(metric, geom) {
        // launch processes
        if (geom[0].type) {
            globals.draw(geom[0]);
        }
        globals.changeMetric(metric[0]);
    });
}
