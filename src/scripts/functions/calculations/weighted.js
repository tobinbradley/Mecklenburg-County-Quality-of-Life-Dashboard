// renormalize/weight a metric
function dataWeighted(dataNumerator, dataDenominator, key, filter) {
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
