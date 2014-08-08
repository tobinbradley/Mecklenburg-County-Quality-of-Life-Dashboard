var model = {
    "selected": []
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
        updateTable();
        updateCountyStats();
        if (recordHistory) { recordMetricHistory(); }
        recordHistory = true;
    }

    // Hopping in the DeLorean
    if (_.contains(tasklist, "year")) {
        // change year slider if not samsies
        if ($('.slider').slider('value') !== model.year) {
            $('.slider').slider('value', model.year);
        }
        year = model.year;
        $('.time-year').text(metricData[model.year].year.replace("y_", ""));
        drawMap();
        drawBarChart();
        updateTable();
        updateCountyStats();
    }

    // the selected set changed
    if (_.contains(tasklist, "selected")) {

        if (model.selected.length > 0) {
            // map selection
            d3.selectAll(".geom").classed("d3-select", function(d) { return _.contains(model.selected, $(this).attr("data-id")); });

            // enable report links
            $(".report-launch").removeClass("disabled");

            // bar chart
            valueChart.selectedPointer(".value-select");

            // line chart
            lineChartCreate();

            // blocks and tables
            _.each(model.selected, function(d) {
                d3Select(d);
            });
        }
        else {
            // clear all the things
            d3.selectAll(".geom").classed("d3-select", false);
            d3.select(".value-select").selectAll("circle").remove();
            lineChartCreate();
            $(".datatable-container tbody tr").remove();
            $(".stats-selected").text("N/A");
            $(".report-launch").addClass("disabled");
            try { map.removeLayer(marker); }
            catch (err) {}
        }
    }

}

Object.observe(model, function(changes) {
    modelChanges(changes);

    // changes.forEach(function(change, i){
    //
    // //   console.log('what property changed? ' + change.name);
    // //   console.log('how did it change? ' + change.type);
    // //   console.log('what was the old value? ' + change.oldValue);
    // //   console.log('whats the current value? ' + change.object[change.name]);
    //   //
    // //   console.log(changes, model);
    //});
});
