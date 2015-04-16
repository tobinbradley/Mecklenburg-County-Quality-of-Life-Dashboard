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
        // hack for ie and ff not picking up n arg on page load
        // probably because they use the object.observe polyfill
        if (getURLParameter("n") !== "null") {
            var arr = getURLParameter("n").split(",");
            if (document.querySelectorAll(".geom.d3-select").length !== arr.length) {
                recordHistory = false;
                updateSelected();
            }
        }
    }

    // the selected set changed
    if (_.contains(tasklist, "selected")) {
        updateSelected();
    }
}

// update the selected stuff
// I had to move this out because IE and FF use a object.observe polyfill
// and it wasn't catching selected polys passed in on page load.
function updateSelected() {
    var geom = d3.selectAll(".geom");
    geom.classed("d3-select", function(d) { return _.contains(model.selected, $(this).attr("data-id")); });
    // bring selected geog to front if browser not crap
    if (!L.Browser.ie) {
        d3Layer.eachLayer(function (layer) {
            if (layer._path.getAttribute("class").indexOf('d3-select') !== -1) {
                layer.bringToFront();
            }
        });
        if (typeof overlay !== 'undefined') { geojson.bringToFront(); }
    }
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
