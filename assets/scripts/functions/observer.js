var model = {
    "selected": [],
    "metricAccuracy": [],
    "metricRaw": [],
    "metricRawAccuracy": []
};

function modelChanges(changes) {

    var tasklist = _.pluck(changes, 'name');

    // Just got the geometry yo. Let's make a map.
    if (_.contains(tasklist, "geom")) {
        initMap();
        initTypeahead();
    }

    // the metric id changed, get some data
    if(_.contains(tasklist, "metricId")) {
        // change chosen if not samsies
        if (model.metricId !== undefined && $(".chosen-select").chosen().val() !== model.metricId) {
            $('.chosen-select').val(model.metricId);
            $('.chosen-select').trigger("chosen:updated");
        }
        fetchMetricData(model.metricId);
    }

    // Metrics in the house
    if (_.contains(tasklist, "metric")) {
        processMetric();
        drawMap();
        drawBarChart();
        lineChartCreate();
        updateMeta();
        drawTable();
        updateStats();
        if (recordHistory) { recordMetricHistory(); }
        recordHistory = true;
    }

    // Hopping in the DeLorean
    if (_.contains(tasklist, "year")) {
        // change year slider if not samsies
        if ($('.slider').slider('value') !== model.year) {
            $('.slider').slider('value', model.year);
        }
        $('.time-year').text(metricData[model.year].year.replace("y_", ""));
        drawMap();
        drawBarChart();
        drawTable();
        updateStats();
    }

    // the selected set changed
    if (_.contains(tasklist, "selected")) {
            // map selection
            d3.selectAll(".geom").classed("d3-false");
            d3.selectAll(".geom").classed("d3-select", function(d) { return _.contains(model.selected, $(this).attr("data-id")); });
            // enable report links
            $(".report-launch").removeClass("disabled");
            // bar chart
            valueChart.selectedPointer(".value-select");
            // line chart
            lineChartCreate();
            // table
            drawTable();
            // fancy metric blocks
            updateStats();

        if (model.selected.length === 0) {
            // disable report links and remove map marker
            $(".report-launch").addClass("disabled");
            try { map.removeLayer(marker); }
            catch (err) {}
        }
    }

}

Object.observe(model, function(changes) {
    modelChanges(changes);
});
