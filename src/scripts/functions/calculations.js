// ****************************************
// Serious mathing
// ****************************************

// Filter our selected records out
function dataFilter(dataSet, filter) {
    return _.filter(dataSet, function(el) { return filter.indexOf(el.id) !== -1; });
}

// strip to just numbers
function dataStrip(dataSet, key) {
    return _.filter(_.pluck(dataSet, key), function (el) {  return $.isNumeric(el); }).map(Number);
}


// This is where you can set new calculation types.
function dataCrunch(theType, key, filter) {
    var theReturn;
    if (typeof filter === "undefined") { filter = null; }

    switch (theType) {
        case "sum":
            theReturn = dataSum(model.metric, key, filter);
            break;
        case "mean":
            theReturn = dataMean(model.metric, key, filter);
            break;
        case "weighted":
            theReturn = dataWeighted(model.metricRaw, model.metricDenominator, key, filter);
            break;
    }
    return theReturn;
}
