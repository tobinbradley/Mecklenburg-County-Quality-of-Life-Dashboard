// ****************************************
// Fetch metric data, grabbing extra stuff like raw data
// if it's available.
// ****************************************
function fetchAccuracy(m) {
    if (metricAccuracy.indexOf(m) !== -1) {
        return $.get("data/metric/" + m + "-accuracy.json");
    }
    else { return [[]]; }
}
function fetchRaw(m) {
    if (hasRaw(m)) {
        return $.get("data/metric/" + getRaw(m) + ".json");
    }
    else { return [[]]; }
}
function fetchGeometry() {
    if (typeof(d3Layer) == "undefined") {
        return $.get("data/geography.topo.json");
    }
    else { return [[]]; }
}
function fetchMetricData(m) {
    $.when(
        $.get("data/metric/" + m + ".json"),
        fetchGeometry(),
        fetchAccuracy(m),
        fetchRaw(m)
    ).then(function(metric, geom, accuracy, raw) {

        // set the raw stuff
        model.metricAccuracy = accuracy[0];
        model.metricRaw = raw[0];

        // set the geometry if it's there
        if (geom[0].type) {
            model.geom = geom[0];
        }

        // update the metric
        model.metric = metric[0];

    });
}
