var model = {};

function modelChanges(changes) {

    var tasklist = _.pluck(changes, 'name');

    // Just got the geometry yo. Let's make a map.
    if (_.contains(tasklist, "geom")) {
        initMap();
        initTypeahead();
    }

    // the metric id changed, get some data
    if(_.contains(tasklist, "metricId")) {
        fetchMetricData(model.metricId);
    }

    // Metrics in the house
    if (_.contains(tasklist, "metric")) {
        processMetric();
        drawMap();
        drawBarChart();
        drawLineChart();
        updateMeta();
        updateTable();
        updateCountyStats();
        if (recordHistory) { recordMetricHistory(); }
        recordHistory = true;
    }

    // Hopping in the DeLorean
    if (_.contains(tasklist, "year")) {
        drawMap();
        drawBarChart();
        updateTable();
        updateCountyStats();
    }

    // maybe a selected array?
    if (_.contains(tasklist, "selected")) {
        if (model.selected.length === 0) {
            // clear all the things
            d3.selectAll(".geom").classed("d3-select", false);
            d3.select(".value-select").selectAll("rect, line, text, circle").remove();
            d3.selectAll(".trend-select").selectAll("path, circle").remove();
            $(".datatable-container tbody tr").remove();
            $(".stats-selected").text("N/A");
            $(".report-launch").addClass("disabled");
            try { map.removeLayer(marker); }
            catch (err) {}
        }
        else {
            //console.log("processing selected");
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
