// ****************************************
// Fetch metric data.
// Depending on the metric, different files may be fetched.
// ****************************************
function fetchAccuracy(m) {
    if (metricConfig[m].accuracy) {
        return $.get("data/metric/" + m + "-accuracy.json");
    }
    else { return [[]]; }
}
function fetchRaw(m) {
    if (metricConfig[m].raw_label || metricConfig[m].type === "weighted" || metricConfig[m].type === "sum") {
        return $.get("data/metric/r" + metricConfig[m].metric + ".json");
    }
    else { return [[]]; }
}
function fetchDenominator(m) {
    if (metricConfig[m].type === "weighted") {
        return $.get("data/metric/d" + metricConfig[m].metric + ".json");
    }
    else { return [[]]; }
}
function fetchNormalized(m) {
    if (metricConfig[m].type === "mean") {
        return $.get("data/metric/n" + metricConfig[m].metric + ".json");
    }
    else { return [[]]; }
}
function fetchGeometry() {
    if (d3Layer === undefined) {
        return $.get("data/geography.topo.json");
    }
    else { return [[]]; }
}


function fetchMetricData(m) {
    // fetch data based on metric
    switch (metricConfig[m].type) {
        case "sum":
            $.when(
                fetchGeometry(),
                fetchAccuracy(m),
                fetchRaw(m)
            ).then(function(geom, accuracy, raw) {
                if (geom[0].type) { model.geom = geom[0]; }
                model.metricAccuracy = accuracy[0];
                model.metric = raw[0];
            });
            break;
        case "mean":
            $.when(
                fetchGeometry(),
                fetchAccuracy(m),
                fetchNormalized(m),
                fetchRaw(m)
            ).then(function(geom, accuracy, normalized, raw) {
                if (geom[0].type) { model.geom = geom[0]; }
                model.metricAccuracy = accuracy[0];
                model.metricRaw = raw[0];
                model.metric = normalized[0];
            });
            break;
        case "weighted":
            $.when(
                fetchGeometry(),
                fetchAccuracy(m),
                fetchRaw(m),
                fetchDenominator(m)
            ).then(function(geom, accuracy, raw, denominator) {
                if (geom[0].type) { model.geom = geom[0]; }
                model.metricAccuracy = accuracy[0];
                model.metricRaw = raw[0];
                model.metricDenominator = denominator[0];

                var calcMetric = $.extend(true, {}, model.metricRaw);
                var keys = _.without(_.keys(model.metricRaw[0]), "id");

                 _.each(calcMetric, function(theval, i) {
                    _.each(keys, function(key) {
                        theRaw = model.metricRaw[i][key];
                        theDemoninator = model.metricDenominator[i][key];
                        theval[key] = theRaw / theDemoninator;
                    });
                });

                model.metric = calcMetric;
            });
            break;
    }
}
