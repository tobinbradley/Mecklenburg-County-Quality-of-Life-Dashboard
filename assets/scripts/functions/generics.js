// ****************************************
// Return metric mean (array)
// ****************************************
function mean(metric) {
    if(metric.length > 0) {
        var themean = {},
            keys = Object.keys(metric[0]);
        _.each(keys, function(el, i) {
            if (i > 0) {
                var sum = 0,
                    counter = 0;
                _.each(metric, function(d) {
                    if ($.isNumeric(d[el])) {
                        sum += Number(d[el]);
                        counter++;
                    }
                });

                themean[el] = (sum/counter).toFixed(1);
            }
        });
        return themean;
    } else {
        return false;
    }
}


// ****************************************
// Return aggregate metric mean (array)
// ****************************************
function aggregateMean(metric, raw) {
    if (metric.length > 0 && raw.length > 0) {
        var mean = {},
            keys = Object.keys(metric[0]);

        _.each(keys, function(el, i){
            if (i > 0) {
                var numer = 0,
                    denom = 0;
                _.each(metric, function(d, i) {
                    if ($.isNumeric(d[el]) && $.isNumeric(raw[i][el]) && Number(d[el]) !== 0) {
                        numer = numer + Number(raw[i][el]);
                        denom = denom + (Number(raw[i][el]) / d[el]);
                    }
                });
                if (denom === 0) { denom = 1; }
                mean[el] = numer / denom;
            }
        });
        return mean;
    }
    else {
        return false;
    }
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
// Return the sum for total-able metrics
// ****************************************
function sum(values) {
    var theSum = 0;
    _.each(values, function(el) {
        if ($.isNumeric(el)) {
            theSum = theSum + Number(el);
        }
    });
    return theSum;
}

// ****************************************
// Get number of numbers after the decimal
// ****************************************
Number.prototype.getDecimals = function() {
    var num = this,
        match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    if (!match) {
        return 0;
    }
    return Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0));
};

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
// Format metric data (see config.js)
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
