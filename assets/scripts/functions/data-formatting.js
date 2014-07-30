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
