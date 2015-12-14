// ****************************************
// Fetch metric data and geography.
// ****************************************
function fetchGeometry() {
    if (d3Layer === undefined) {
        return $.getJSON("data/geography.topo.json");
    }
    else { return [[]]; }
}
function fetchData(m) {
    return $.getJSON("data/metric/m" + metricConfig[m].metric + ".json");
}

function fetchMetricData(m) {
    // fetch data based on metric
    switch (metricConfig[m].type) {
        case "sum":
            $.when(
                fetchGeometry(),
                fetchData(m)
            ).then(function(geom, data) {
                if (geom[0].type) { model.geom = geom[0]; }
                if (data[0]["m" + metricConfig[m].metric + "-accuracy"]) { model.metricAccuracy = data[0]["m" +metricConfig[m].metric + "-accuracy"]; }
                model.metric = data[0]["r" + metricConfig[m].metric];
            });
            break;
        case "mean":
            $.when(
                fetchGeometry(),
                fetchData(m)
            ).then(function(geom, data) {
                if (geom[0].type) { model.geom = geom[0]; }
                if (data[0]["m" + metricConfig[m].metric + "-accuracy"]) { model.metricAccuracy = data[0]["m" +metricConfig[m].metric + "-accuracy"]; }
                model.metricRaw = data[0]["r" + metricConfig[m].metric];
                model.metric = data[0]["n" + metricConfig[m].metric];
            });
            break;
        case "weighted":
            $.when(
                fetchGeometry(),
                fetchData(m)
            ).then(function(geom, data) {
                if (geom[0].type) { model.geom = geom[0]; }
                if (data[0]["m" + metricConfig[m].metric + "-accuracy"]) { model.metricAccuracy = data[0]["m" +metricConfig[m].metric + "-accuracy"]; }
                model.metricRaw = data[0]["r" + metricConfig[m].metric];
                model.metricDenominator = data[0]["d" + metricConfig[m].metric];

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
