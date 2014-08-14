// Ye olde prototypes. A big man would have more stuff here. I AM NOT A BIG MAN.

// Get the mean for stuff. NPA's passed for the report are filtered before they get here.
function mean(metric) {
    if(metric.length > 0) {
        var mean = {},
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

                mean[el] = (sum/counter).toFixed(1);
            }
        });
        return mean;
    } else {
        return false;
    }
}

// weighted means for crazy people
function weightedMean(metric, raw) {
    if (metric.length > 0 && raw.length > 0) {
        var mean = {},
            keys = Object.keys(metric[0]);

        _.each(keys, function(el, i){
            if (i > 0) {
                var sum = 0,
                    denom = 0;
                _.each(metric, function(d, i) {
                    if ($.isNumeric(d[el])) {
                        sum = sum + (d[el] * Number(raw[i][el]));
                        denom = denom + Number(raw[i][el]);
                    }
                });
                mean[el] = sum / denom;
            }
        });
        return mean;
    }
    else {
        return false;
    }
}

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

function sum(values) {
    var theSum = 0;
    _.each(values, function(el) {
        if ($.isNumeric(el)) {
            theSum = theSum + Number(el);
        }
    });
    return theSum;
}

// Nothing fancy here, just grabs GET parameters
function getURLParameter(name) {
    return decodeURI(
        (new RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}


String.prototype.commafy = function () {
    return this.replace(/(^|[^\w.])(\d{4,})/g, function($0, $1, $2) {
        return $1 + $2.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,");
    });
};
Number.prototype.commafy = function () {
    return String(this).commafy();
};

// format data
// see config.js to check out the various types/filters I have set up
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
    }
    else {
        pretty = "N/A"
    }
    return prefix + pretty + suffix;
}
