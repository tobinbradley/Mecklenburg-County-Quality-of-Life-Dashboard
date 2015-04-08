// ****************************************
// Execute model changes
// ****************************************
function modelChanges(changes) {

    var tasklist = _.pluck(changes, 'name');

    // Just got the geometry yo. Let's make a map.
    if (_.contains(tasklist, "geom")) {
        initMap();
        initTypeahead();
    }

    // the metric id changed, get some data
    if (_.contains(tasklist, "metricId")) {
        // Make sure a year has been set before
        var metricChange = _.filter(changes, function(el) { return el.name === "metricId"; });
        if (metricChange[0].hasOwnProperty('oldValue')) {
            // change select if not samsies
            if (model.metricId !== undefined && $(".chosen-select").val() !== model.metricId) {
                $('.chosen-select').val(model.metricId);
            }
            fetchMetricData(model.metricId);
        }
    }

    // Metrics in the house
    if (_.contains(tasklist, "metric")) {
        processMetric();
        drawMap();
        drawBarChart();
        lineChartCreate();
        updateMeta();
        updateStats();
        drawTable();
        if (recordHistory) { recordMetricHistory(); }
        recordHistory = true;
    }

    // the selected set changed
    if (_.contains(tasklist, "selected")) {
            d3.selectAll(".geom").classed("d3-select", false);
            d3.selectAll(".geom").classed("d3-select", function(d) { return _.contains(model.selected, $(this).attr("data-id")); });
            $(".report-launch").removeClass("disabled");
            valueChart.selectedPointer(".value-select");
            lineChartCreate();
            updateStats();
            drawTable();
            if (recordHistory) { recordMetricHistory(); }
            recordHistory = true;
        if (model.selected.length === 0) {
            // disable report links and remove map marker
            $(".report-launch").addClass("disabled");
            try { map.removeLayer(marker); }
            catch (err) {}
        }
    }

}


function changeYear() {
    // change year slider if not samsies
    if ($('.slider').slider('value') !== model.year) {
        $('.slider').slider('value', model.year);
    }
    var keys = Object.keys(model.metric[0]);
    $('.time-year').text(keys[model.year + 1].replace("y_", ""));
    // set up data quantile from extent
    quantize = getScale(x_extent, colorbreaks);
    drawMap();
    drawBarChart();
    drawTable();
    updateStats();
}
