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
// Capitalize first letter of strings
// ****************************************
String.prototype.toProperCase = function(opt_lowerCaseTheRest) {
  return (opt_lowerCaseTheRest ? this.toLowerCase() : this)
    .replace(/(^|[\s\xA0])[^\s\xA0]/g, function(s){ return s.toUpperCase(); });
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

    if (theMetric !== null && metricConfig[theMetric].decimals) {
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
