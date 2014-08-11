// This set of functions is to fetch data. We're using jQuery promises to make
// sure everything we need is fetched and we don't get synchronously boned.

function fetchAccuracy(m) {
    if (metricAccuracy.indexOf(m) !== -1) {
        return $.get("data/metric/" + m + "-accuracy.json");
    }
    else { return [[]]; }
}
function fetchRaw(m) {
    if (metricRaw[m]) {
        return $.get("data/metric/" + metricRaw[m] + ".json");
    }
    else { return [[]]; }
}
function fetchRawAccuracy(m) {
    if (metricRaw[m] && metricAccuracy.indexOf(metricRaw[m]) >= 0) {
        return $.get("data/metric/" + metricRaw[m] + "-accuracy.json");
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
        fetchRaw(m),
        fetchRawAccuracy(m)
    ).then(function(metric, geom, accuracy, raw, rawaccuracy) {

        // set the raw stuff
        model.metricAccuracy = accuracy[0];
        model.metricRaw = raw[0];
        model.metricRawAccuracy = rawaccuracy[0];

        // set the geometry if it's there
        if (geom[0].type) {
            model.geom = geom[0];
        }

        // update the metric
        model.metric = metric[0];

    });
}
