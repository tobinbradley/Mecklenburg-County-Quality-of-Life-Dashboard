// Prototype for moving svg element to the front
// Useful so highlighted or selected element border goes on top
d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};


// Hover events
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
        d3.selectAll('[data-id="' + theId + '"]').classed("d3-highlight", true);
        //$('[data-id="' + theId + '"]').addClass('d3-highlight');
        if ($.isNumeric(theValue)) {
            trendChart.lineAdd(".trend-highlight", theId);
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
        d3.selectAll('[data-id="' + theId + '"]').classed("d3-highlight", false);
        valueChart.pointerRemove(theId, ".value-hover");
        trendChart.linesRemove(".trend-highlight");
    }
    else {
        d3.selectAll('[data-quantile="' + elem.data('quantile') + '"]').classed("d3-highlight", false);
    }
}

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

function d3Select(msg, d) {
    if (d.d3obj.classed("d3-select") && msg !== "geocode") {
        d.d3obj.classed("d3-select", false);

        // remove chart shit
        trendChart.lineRemove(d.d3obj.attr("data-id"), ".trend-select");
        valueChart.pointerRemove(d.d3obj.attr("data-id"), ".value-select");

        // remove table shit
        $(".datatable-container tr[data-id='" + d.d3obj.attr("data-id") + "']").remove();
        updateSelectedStats();
    }
    else {
        d.d3obj.classed("d3-select", true);
        if ($.isNumeric(d.d3obj.attr("data-value"))) {
            // add to chart
            trendChart.lineAdd(".trend-select", d.d3obj.attr("data-id"));
            valueChart.pointerAdd(d.d3obj.attr("data-id"), d.d3obj.attr("data-value"), ".value-select");
        }
        // add to table
        drawTable(d.d3obj.attr("data-id"), d.d3obj.attr("data-value"));
    }
}

// draw table
function updateTable() {
    _.each($(".datatable-container tbody tr"), function(el) {
        var theId = $(el).data("id");
        drawTable(theId, metricData[year].map.get(theId));
    });
}

// update table rows
function drawTable(id, val) {
    var tableRec = {};
    tableRec.id = id;
    if ($.isNumeric(val)) {
        tableRec.value = val;
    }
    if (accuracyData.length > 0) {
        tableRec.accuracy = _.filter(accuracyData, function(r) { return r.id == id; })[0][metricData[year].year];
    }
    if (rawData.length > 0) {
        tableRec.raw = _.filter(rawData, function(r) { return r.id == id; })[0][metricData[year].year];
        tableRec.rawM = metricRaw[id];
    }
    if (rawAccuracy.length > 0) {
        tableRec.rawaccuracy = _.filter(rawAccuracy, function(r) { return r.id == id; })[0][metricData[year].year];
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

// update stat boxes
function updateSelectedStats() {
    var m = $("#metric").val(),
        selectedWeightedMean = "N/A",
        selectedMean = "N/A",
        values = [],
        count = 0;

    // Selected Mean
    if ($(".datatable-container tbody tr").size() > 0) {
        $(".datatable-value").each(function() {
            if ($.isNumeric($(this).html().replace(/[A-Za-z$-\,]/g, ""))) {
                values.push(parseFloat($(this).html().replace(/[A-Za-z$-\,]/g, "")));
            }
        });
        if (values.length > 0) {
            selectedTotal = values.reduce(function(a, b) { return a + b;});
            selectedMean = selectedTotal / values.length;
        }
    }
    $(".stats-mean-selected").text(dataPretty(selectedMean, m));

    // selected weighted mean
    if (metricRaw[m]) {
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
            console.log(values);
            //if (values.length > 0) {
                selectedWeightedMean = values.reduce(function(a, b) { return a + b;}) / count;
            //}
        }
    }

    $(".stats-weighted-mean-selected").text(dataPretty(selectedWeightedMean, m));

}

function updateCountyStats() {
    var m = $("#metric").val(),
        countyWeightedMean = "N/A",
        selectedWeightedMean = "N/A",
        values = [],
        count = 0;

    // County npa mean and median
    $(".stats-county-npa-mean").text(dataPretty(d3.mean(metricData[year].map.values()), m));
    $(".stats-county-npa-median").text("Median: " + dataPretty(d3.median(metricData[year].map.values()), m));

    if (metricRaw[m]) {
        _.each(rawData, function(d) {
            if ($.isNumeric(d[metricData[year].year])) {
                values.push(d[metricData[year].year] * metricData[year].map.get(d.id));
                count += parseFloat(d[metricData[year].year]);
            }
        });
        countyWeightedMean = values.reduce(function(a, b) { return a + b;}) / count;
    }
    $(".stats-weighted-mean-county").text(dataPretty(countyWeightedMean, m));
}

function d3Zoom(msg, d) {
    if ($(".geom.d3-select").length === 0 || msg === "geocode" || msg === "findNeighborhood") {
        var feature = _.filter(d3Layer.toGeoJSON().features, function(data) { return data.id === d.id; });
        map.fitBounds(L.geoJson(feature[0]).getBounds());
    }
}

function d3ZoomPolys(msg, d) {
    var features = _.filter(d3Layer.toGeoJSON().features, function(data) { return _.contains(d.ids, data.id); });
    var bounds = L.latLngBounds(L.geoJson(features[0]).getBounds());
    _.each(features, function(feature) {
        bounds.extend(L.geoJson(feature).getBounds());
    });
    map.fitBounds(bounds);
}

// Add marker
function addMarker(msg, d) {
    // remove old markers
    try { map.removeLayer(marker); }
    catch (err) {}

    // add new marker
    marker = L.marker([d.lat, d.lng]).addTo(map);
    //map.panTo([d.lat, d.lng]);

}


// format data
function dataPretty(theValue, theMetric) {
    var fmat = d3.format("0,000.0"),
        prefix = "",
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
    return prefix + pretty + suffix;
}
