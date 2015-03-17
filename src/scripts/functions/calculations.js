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
        case "normalize":
            theReturn = dataNormalize(model.metricRaw, model.metricDenominator, key, filter);
            break;
    }
    return theReturn;
}


// ****************************************
// Return median metric value
// ****************************************
function median(values) {
    values.sort( function(a,b) {return a - b;} );
    var half = Math.floor(values.length/2);
    if(values.length % 2) {
        return values[half];
    }
    else {
        return (values[half-1] + values[half]) / 2.0;
    }
}
