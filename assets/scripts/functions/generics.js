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
                    if ($.isNumeric(d[el])) {
                        numer = numer + Number(raw[i][el]);
                        denom = denom + (Number(raw[i][el]) / d[el]);
                    }
                });
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
// Format metric data (see config.js)
// ****************************************
function dataPretty(theValue, theMetric) {
    var prefix = "",
        suffix = "",
        pretty = theValue;

    if ($.isNumeric(theValue)) {
        pretty = parseFloat(parseFloat(theValue).toFixed(1)).toString().commafy();
        if (metricPct.indexOf(theMetric) !== -1) { suffix = "%"; }
        if (metricMoney.indexOf(theMetric) !== -1) {
            prefix = "$";
            pretty = parseFloat(theValue).toFixed(0).commafy();
        }
        if(metricYear.indexOf(theMetric) !== -1) {
            pretty = parseFloat(pretty.replace(",", "")).toFixed(0);
        }
        if (metricRidiculousDecimals.indexOf(theMetric) !== -1) {
            pretty = parseFloat(parseFloat(theValue).toFixed(3)).toString().commafy();
        }
    }
    else {
        pretty = "N/A";
    }
    return prefix + pretty + suffix;
}
