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

// sum a metric
function dataSum(dataSet, key, filter) {
    // apply filter if passed
    if (typeof filter !== "undefined" && filter !== null) {
       dataSet = dataFilter(dataSet, filter);
    }

    // reduce dataSet to numbers - no nulls
    dataSet = dataStrip(dataSet, key);

    if (dataSet.length > 0) {
        // calculate
        var total = dataSet.reduce(function(a, b) {
            return a + b;
        });
        return total;
    } else {
        return 'N/A';
    }
}

// average a metric
function dataMean(dataSet, key, filter) {
    // apply filter if passed
    if (typeof filter !== "undefined" && filter !== null) {
       dataSet = dataFilter(dataSet, filter);
    }

    // reduce dataSet to numbers - no nulls
    dataSet = dataStrip(dataSet, key);

    if (dataSet.length > 0) {
        // calculate
        var total = dataSet.reduce(function(a, b) {
            return a + b;
        });
        return total / dataSet.length;
    } else {
        return 'N/A';
    }
}

// decide which computation to run and run it
function dataCrunch(key, filter) {
    var theReturn;
    if (typeof filter === "undefined") { filter = null; }

    switch (metricConfig[model.metricId].type) {
        case "sum":
            theReturn = dataSum(model.metric, key, filter);
            break;
        case "mean": case "normalize":
            theReturn = dataMean(model.metric, key, filter);
            break;
        // experimental - use with caution!
        // case "normalize":
        //     theReturn = dataNormalize(model.metricRaw, model.metricDenominator, key, filter);
        //     break;
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
