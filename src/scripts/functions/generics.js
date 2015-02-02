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

// renormalize a metric
function dataNormalize(dataNumerator, dataDenominator, key, filter) {
    // apply filter if passed
    if (typeof filter !== "undefined" && filter !== null) {
        dataNumerator = dataFilter(dataNumerator, filter);
        dataDenominator = dataFilter(dataDenominator, filter);
    }

    // reduce dataSet to numbers - no nulls
    dataNumerator = dataStrip(dataNumerator, key);
    dataDenominator = dataStrip(dataDenominator, key);

    if (dataNumerator.length > 0 && dataDenominator.length > 0) {
        // calculate
        var totalNumerator = dataNumerator.reduce(function(a, b) {
            return a + b;
        });
        var totalDenominator = dataDenominator.reduce(function(a, b) {
            return a + b;
        });
        return totalNumerator / totalDenominator;
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


// ****************************************
// Compare two arrays to see if the are the same
// ****************************************
Array.prototype.compare = function(testArr) {
    if (this.length !== testArr.length) { return false; }
    for (var i = 0; i < testArr.length; i++) {
        if (this[i].compare) {
            if (!this[i].compare(testArr[i])) { return false; }
        }
        if (this[i] !== testArr[i]) { return false; }
    }
    return true;
};


// ****************************************
// Add commas to numbers (i.e. 1,123,123)
// ****************************************
String.prototype.commafy = function () {
    return this.replace(/(^|[^\w.])(\d{4,})/g, function($0, $1, $2) {
        return $1 + $2.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,");
    });
};
Number.prototype.commafy = function () {
    return String(this).commafy();
};

// ****************************************
// Get URL GET Parameters
// ****************************************
function getURLParameter(name) {
    return decodeURI(
        (new RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}

// ****************************************
// The trend arrow thing for the tables
// ****************************************
function getTrend(x1, x2) {
    if ($.isNumeric(x1) && $.isNumeric(x2)) {
        var theDiff = x1 - x2;
        if (theDiff === 0) {
            return "&#8596; 0";
        } else if (theDiff > 0) {
            return "<span class='glyphicon glyphicon-arrow-up'></span> " + dataPretty(theDiff, model.metricId).replace("%","").replace("$","");
        }
        else if (theDiff < 0) {
            return "<span class='glyphicon glyphicon-arrow-down'></span> " + dataPretty(Math.abs(theDiff), model.metricId).replace("%","").replace("$","");
        }
    }
    else {
        return "--";
    }
}

// ****************************************
// Format metric data
// ****************************************
function dataRound(theValue, theDecimals) {
    return Number(theValue.toFixed(theDecimals));
}
function dataFormat(theValue, theMetric) {
  var prefix = "",
  suffix = "";

  if (theMetric) {
    prefix = nullCheck(metricConfig[theMetric].prefix);
    suffix = nullCheck(metricConfig[theMetric].suffix);
  }

  return prefix + theValue.toString().commafy() + suffix;
}
function nullCheck(theCheck) {
    if (!theCheck) {
        return "";
    }
    else {
        return theCheck;
    }
}
function dataPretty(theValue, theMetric) {
    var pretty,
        numDecimals = 0;

    if (theMetric !== null) {
        numDecimals = metricConfig[theMetric].decimals;
    }

    if ($.isNumeric(theValue)) {
        pretty = dataFormat(dataRound(Number(theValue), numDecimals), theMetric);
    }
    else {
        pretty = "N/A";
    }
    return pretty;
}
