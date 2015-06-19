// *************************************************
// Process the new metric (slider/time, data extent and quantiles, set year values)
// *************************************************
function processMetric() {
    var keys = _.without(_.keys(model.metric[0]), "id");

    model.year = keys.length - 1;
    model.years = keys;
    $('.time-year').text(keys[model.year].replace("y_", ""));

    // hide or show year related stuff
    if (model.years.length > 1) {
        $(".temporal").show();
        // set slider and time related stuff
        $('.slider label').remove();
        $(".slider").slider("option", "max", keys.length - 1).each(function() {
            var vals = $(this).slider("option", "max") - $(this).slider("option", "min");
            for (var i = 0; i <= vals; i++) {
                // Create a new element and position it with percentages
                var el = $('<label>' + keys[i].replace("y_", "") + '</label>').css('left', (i/vals*100) + '%');
                // Add the element inside #slider
                $(this).append(el);
            }
        });
        $(".slider").slider("value", $(".slider").slider("option", "max"));
    } else {
        $(".temporal").hide();
    }


    // Set up data extent
    theVals = dataStripAll(model.metric);
    x_extent = d3.extent(theVals);

    // set up data quantile from extent
    quantize = getScale(x_extent, colorbreaks, theVals);
}

// ****************************************
// Record history via pushstate and GA
// ****************************************
function recordMetricHistory() {
    // write metric viewed out to GA
    if (window.ga) {
        theMetric = $("#metric option:selected");
        ga('send', 'event', 'metric', theMetric.text().trim(), theMetric.parent().prop("label"));
    }
    if (history.pushState) {
        history.pushState({myTag: true}, null, "?m=" + model.metricId + "&n=" + model.selected.join());
    }
}


// ****************************************
// Get a count of neighborhoods in each quantile (array)
// ****************************************
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


// ****************************************
// Return a D3 scale
// If you want to do some different or custom scaling,
// this is the place.
// ****************************************
function getScale(extent, breaks, values) {
    if (metricConfig[model.metricId].scale) {
        extent = _.clone(metricConfig[model.metricId].scale);
        extent.push(x_extent[1]);
        extent.unshift(x_extent[0]);
    }
    else if (quantileScale === "jenks") {
        extent = ss.jenks(values, 5).slice(1);
    }

    return d3.scale.quantile()
        .domain(extent)
        .range(d3.range(breaks).map(function (i) {
            return "q" + i;
        }));
}


// ****************************************
// Make the nerd table via Underscore template
// ****************************************
function drawTable() {
    var template = _.template($("script.template-table").html()),
        theSelected = dataFilter(model.metric, model.selected),
        theAccuracy = dataFilter(model.metricAccuracy, model.selected),
        theRaw = dataFilter(model.metricRaw, model.selected),
        keys = Object.keys(model.metric[0]);

    $(".datatable-container").html(template({
        "theSelected": theSelected,
        "theAccuracy": theAccuracy,
        "theRaw": theRaw,
        "keys": keys
    }));
}

// ****************************************
// Update stat boxes for study area and selected
// Stat boxes are those two suckers sitting above the charts
// ****************************************
function updateStats() {
    var m = model.metricId,
        keys = Object.keys(model.metric[0]),
        theStat,
        params = {},
        year = model.years[model.year],
        template = _.template($("script.template-statbox").html());

    // median
    theStat = median(_.map(model.metric, function(num){ if ($.isNumeric(num[keys[model.year + 1]])) { return Number(num[keys[model.year + 1]]); } }));
    $(".median").html(dataPretty(theStat, m));

    // set the units for the stat boxes
    params.mainUnits = nullCheck(metricConfig[model.metricId].label);
    params.rawUnits = nullCheck(metricConfig[model.metricId].raw_label);

    // County stat box
    params.topText = "COUNTY";
    theStat = dataCrunch(metricConfig[model.metricId].type, year);
    params.mainNumber = dataPretty(theStat, m);
    // raw number
    if (metricConfig[model.metricId].raw_label) {
        params.rawTotal = dataSum(model.metricRaw, year).toFixed(0).commafy();
    }
    // write out stat box
    $(".stat-box-county").html(template(params));


    // Selected NPAs
    params.topText = 'SELECTED <a href="javascript:void(0)" tabindex="0" class="meta-definition" data-toggle="popover" data-content="' + neighborhoodDefinition + '">' + neighborhoodDescriptor.toUpperCase() + 's</a>';
    // main number
    theStat = dataCrunch(metricConfig[model.metricId].type, year, model.selected);
    params.mainNumber = dataPretty(theStat, m);
    // raw number
    if (metricConfig[model.metricId].raw_label) {
        theStat = dataSum(model.metricRaw, year, model.selected);
        if ($.isNumeric(theStat)) { theStat = theStat.toFixed(0).commafy(); }
        params.rawTotal = theStat;
    }
    // write out stat box
    $(".stat-box-neighborhood").html(template(params));

}


// ****************************************
// Hover highlights for all except the map
// ****************************************
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
