// This is my general dumping ground for odds and ends that don't deservie their
// own JS file.

// Process the metric into useful stuff
function processMetric() {
    // clear metric data
    metricData.length = 0;

    // get the years available
    var keys = Object.keys(model.metric[0]);
    for (var i = 1; i < keys.length; i++) {
        metricData.push({"year": keys[i], "map": d3.map()});
    }

    // hide or show year related stuff
    if (keys.length > 2) {
        $(".temporal").show();
    } else {
        $(".temporal").hide();
    }

    // set slider and time related stuff
    model.year = metricData.length -1;

    // set the data into d3 maps
    _.each(model.metric, function (d) {
        for (var i = 0; i < metricData.length; i++) {
            if ($.isNumeric(d[metricData[i].year])) { metricData[i].map.set(d.id, parseFloat(d[metricData[i].year])); }
        }
    });

    // Set up data extent
    var extentArray = [];
    _.each(metricData, function(d) { extentArray = extentArray.concat(d.map.values()); });
    x_extent = d3.extent(extentArray);

    // set up data quantile from extent
    quantize = d3.scale.quantile()
        .domain(x_extent)
        .range(d3.range(colorbreaks).map(function (i) {
            return "q" + i;
        }));
}

// push metric to GA and state
function recordMetricHistory() {
    // write metric viewed out to GA
    if (window.ga) {
        theMetric = $("#metric option:selected");
        ga('send', 'event', 'metric', theMetric.text().trim(), theMetric.parent().prop("label"));
    }
    if (history.pushState) {
        history.pushState({myTag: true}, null, "?m=" + $("#metric").val());
    }
}


// Hover highlights
// Node there's some weirdness with the geometry doing it this way, so there is
// another function like this specifically for after the geometry is added in
// d3map.js.
$(document).on({
    mouseenter: function(event){
        event.stopPropagation();
        addHighlight($(this));
    },
    mouseleave: function(event){
    event.stopPropagation();
        removeHighlight($(this));
    }
}, '.metric-hover');
function addHighlight(elem) {
    if (elem.attr('data-id')) {
        var theId = elem.attr('data-id');
        var theValue = $('.geom[data-id="' + theId + '"]').attr("data-value");
        d3.selectAll('[data-id="' + theId + '"]').classed("d3-highlight", true).transition().attr("r", 8);
        if ($.isNumeric(theValue)) {
            if(! elem.closest(".barchart-container").length ) { valueChart.pointerAdd(theId, theValue, ".value-hover"); }
        }
    }
    else {
        d3.selectAll('[data-quantile="' + elem.attr('data-quantile') + '"]').classed("d3-highlight", true);
    }
}
function removeHighlight(elem) {
    if (elem.data('id')) {
        var theId = elem.attr('data-id');
        d3.selectAll('[data-id="' + theId + '"]').classed("d3-highlight", false).transition().attr("r", 5);
        valueChart.pointerRemove(theId, ".value-hover");
    }
    else {
        d3.selectAll('[data-quantile="' + elem.data('quantile') + '"]').classed("d3-highlight", false);
    }
}

// Get a count in each quantile
function quantizeCount(data) {
    var q1 = _.countBy(data, function (d) {
        return quantize(d);
    });
    var q2 = [];
    for (var i = 0; i <= colorbreaks - 1; i++) {
        if (!q1["q" + i]) { q1["q" + i] = 0; }
        q2.push({
            "key": "q" + i,
            "value": q1["q" + i]
        });
    }
    return q2;
}

// Select or unselect a neighborhood
function d3Select(id) {
    var d3obj = d3.select(".geom[data-id='" + id + "']");
    // add to table
    drawTable(id, d3obj.attr("data-value"));
}
function d3Unselect(id) {
    var d3obj = d3.select(".geom[data-id='" + id + "']");
    d3obj.classed("d3-select", false);

    valueChart.pointerRemove(id, ".value-select");

    // remove table stuff
    $(".datatable-container tr[data-id='" + id + "']").remove();
    updateSelectedStats();
}


// draw the nerd table
function updateTable() {
    _.each($(".datatable-container tbody tr"), function(el) {
        var theId = $(el).data("id");
        drawTable(theId, metricData[model.year].map.get(theId));
    });
}

// update nerd table rows
function drawTable(id, val) {
    var tableRec = {};
    tableRec.id = id;
    if ($.isNumeric(val)) {
        tableRec.value = val;
    }
    if (accuracyData.length > 0) {
        tableRec.accuracy = _.filter(accuracyData, function(r) { return r.id == id; })[0][metricData[model.year].year];
    }
    if (rawData.length > 0) {
        tableRec.raw = _.filter(rawData, function(r) { return r.id == id; })[0][metricData[model.year].year];
        tableRec.rawM = metricRaw[id];
    }
    if (rawAccuracy.length > 0) {
        tableRec.rawaccuracy = _.filter(rawAccuracy, function(r) { return r.id == id; })[0][metricData[model.year].year];
    }

    var template = _.template($("script.template").html());
    if ($(".datatable-container tr[data-id='" + id + "']").size() === 0) {
        $(".datatable-container tbody").append(template(tableRec));
    }
    else {
        $(".datatable-container tr[data-id='" + id + "']").replaceWith(template(tableRec));
    }

    updateSelectedStats();
}

// update stat boxes for selected stuff
function updateSelectedStats() {
    var m = $("#metric").val(),
        selectedWeightedMean = "N/A",
        keys = Object.keys(model.metric[0]),
        values = [],
        count = 0;

    // selected mean
    var selectedMean = mean(_.filter(model.metric, function(el) { return model.selected.indexOf(el.id.toString()) !== -1; }));
    if(selectedMean) {
        $(".stats-mean-selected").text(dataPretty(selectedMean[keys[model.year + 1]], m));
    } else {
        $(".stats-mean-selected").text("N/A");
    }

    // selected weighted mean
    if (metricRaw[m]) {
        $(".stats-weighted").removeClass('hide');
        // loop through table for selected weighted mean
        if ($(".datatable-container tbody tr").size() > 0) {
            $(".datatable-container tbody tr").each(function() {
                var theValue = $(this).find(".datatable-value").html().replace(/[A-Za-z$-\,]/g, "");
                var theRaw = $(this).find(".datatable-raw").html().replace(/[A-Za-z$-\,]/g, "");
                if ($.isNumeric(theValue) && $.isNumeric(theRaw)) {
                    values.push(parseFloat(theValue * theRaw));
                    count += parseFloat(theRaw);
                }
            });
            //if (values.length > 0) {
                selectedWeightedMean = values.reduce(function(a, b) { return a + b;}) / count;
            //}
        }
    } else {
        $(".stats-weighted").addClass('hide');
    }

    $(".stats-weighted-mean-selected").text(dataPretty(selectedWeightedMean, m));

}

// update stat boxes for global stuff
function updateCountyStats() {
    var m = $("#metric").val(),
        countyWeightedMean = "N/A",
        selectedWeightedMean = "N/A",
        values = [],
        count = 0;

    // County npa mean and median
    $(".stats-county-npa-mean").text(dataPretty(d3.mean(metricData[model.year].map.values()), m));
    $(".stats-county-npa-median").text("Median: " + dataPretty(d3.median(metricData[model.year].map.values()), m));

    if (metricRaw[m]) {
        _.each(rawData, function(d) {
            if ($.isNumeric(d[metricData[model.year].year])) {
                values.push(d[metricData[model.year].year] * metricData[model.year].map.get(d.id));
                count += parseFloat(d[metricData[model.year].year]);
            }
        });
        countyWeightedMean = values.reduce(function(a, b) { return a + b;}) / count;
    }
    $(".stats-weighted-mean-county").text(dataPretty(countyWeightedMean, m));
}
