// This is my general dumping ground for odds and ends that don't deservie their
// own JS file.

// Prototype for moving svg element to the front
// Useful so highlighted or selected element border goes on top
d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};


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
    if (d3obj.classed("d3-select")) {
        d3obj.classed("d3-select", false);

        // remove chart stuff
        trendChart.lineRemove(id, ".trend-select");
        valueChart.pointerRemove(id, ".value-select");

        // remove table stuff
        $(".datatable-container tr[data-id='" + id + "']").remove();
        updateSelectedStats();
    }
    else {
        d3obj.classed("d3-select", true);
        if ($.isNumeric(d3obj.attr("data-value"))) {
            // add to chart
            trendChart.lineAdd(".trend-select", id);
            valueChart.pointerAdd(id, d3obj.attr("data-value"), ".value-select");
        }
        // add to table
        drawTable(id, d3obj.attr("data-value"));
    }

    // toggle report if nothing selected
    if ($('.d3-select').length === 0) {
        $(".report-launch").addClass("disabled");
    } else {
        $(".report-launch").removeClass("disabled");
    }
}

// draw the nerd table
function updateTable() {
    _.each($(".datatable-container tbody tr"), function(el) {
        var theId = $(el).data("id");
        drawTable(theId, metricData[year].map.get(theId));
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

// update stat boxes for selected stuff
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


// Zoom to polygons. I think I'm only using this to get to old neighborhoods.
function d3ZoomPolys(msg, d) {
    var features = _.filter(d3Layer.toGeoJSON().features, function(data) { return _.contains(d.ids, data.id); });
    var bounds = L.latLngBounds(L.geoJson(features[0]).getBounds());
    _.each(features, function(feature) {
        bounds.extend(L.geoJson(feature).getBounds());
    });
    map.fitBounds(bounds);
}


// zoom to neighborhood, adding a marker if it's a lnglat
function geocode(d) {
    // add a marker if a point location is passed
    if (d.lat) {
        try { map.removeLayer(marker); }
        catch (err) {}
        marker = L.marker([d.lat, d.lng]).addTo(map);
    }

    // zoom to neighborhood
    var feature = _.filter(d3Layer.toGeoJSON().features, function(data) { return data.id === d.id; });
    map.fitBounds(L.geoJson(feature[0]).getBounds());

}
