// *************************************************
// Process the new metric (slider/time, data extent and quantiles)
// *************************************************
function processMetric() {
    var keys = Object.keys(model.metric[0]);

    // hide or show year related stuff
    if (keys.length > 2) {
        $(".temporal").show();
    } else {
        $(".temporal").hide();
    }

    // set slider and time related stuff
    $('.slider label').remove();
    $(".slider").slider("option", "max", keys.length - 2).each(function() {
        var vals = $(this).slider("option", "max") - $(this).slider("option", "min");
        for (var i = 0; i <= vals; i++) {
            // Create a new element and position it with percentages
            var el = $('<label>' + keys[i + 1].replace("y_", "") + '</label>').css('left', (i/vals*100) + '%');
            // Add the element inside #slider
            $(this).append(el);
        }
    });
    model.year = keys.length - 2;
    $('.time-year').text(keys[model.year + 1].replace("y_", ""));

    // determine number of decimals to show
    var lastYear = Object.keys(model.metric[0])[model.year + 1];
    numDecimals = _.max(_.map(model.metric, function(el){ return parseFloat(el[lastYear]).getDecimals(); }));

    // Set up data extent
    var theVals = [];
    _.each(keys, function(key, i) {
        if (i > 0) {
            var theMap = _.map(model.metric, function(num){ if ($.isNumeric(num[key])) { return Number(num[key]); } });
            theVals = theVals.concat(theMap);
        }
    });
    x_extent = d3.extent(theVals);

    // set up data quantile from extent
    quantize = d3.scale.quantile()
        .domain(x_extent)
        .range(d3.range(colorbreaks).map(function (i) {
            return "q" + i;
        }));
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
// Make the nerd table via Underscore template
// ****************************************
function drawTable() {
    var template = _.template($("script.template-table").html()),
        theSelected = _.filter(model.metric, function(el) { return model.selected.indexOf(el.id.toString()) !== -1; }),
        theAccuracy = _.filter(model.metricAccuracy, function(el) { return model.selected.indexOf(el.id.toString()) !== -1; }),
        theRaw = _.filter(model.metricRaw, function(el) { return model.selected.indexOf(el.id.toString()) !== -1; }),
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
// Lots of filters and nests and calculations. I don't
// even pretend to know what's going on here anymore.
// People stopped complaining about the numbers being
// wrong so I ran away.
// ****************************************
function updateStats() {
    var m = model.metricId,
        keys = Object.keys(model.metric[0]),
        theStat,
        params = {},
        template = _.template($("script.template-statbox").html());


    // County
    params.topText = "COUNTY";
    if (metricUnits[m]) { params.mainUnits = metricUnits[m]; }
    if (metricUnits[getRaw(m)]) { params.rawUnits = metricUnits[getRaw(m)]; }
    // next do the main number. if it has a raw, aggregate, if not, sum.
    if (hasRaw(m)) {
        theStat = aggregateMean(model.metric, model.metricRaw);
        params.mainNumber = dataPretty(theStat[keys[model.year + 1]], m);
        if (metricSummable.indexOf(getRaw(m)) !== -1) {
            params.rawTotal = sum(_.map(model.metricRaw, function(num){ return num[keys[model.year + 1]]; })).toFixed(0).commafy();
        }
    } else {
        theStat = sum(_.map(model.metric, function(num){ return num[keys[model.year + 1]]; }));
        params.mainNumber = dataPretty(theStat, m);
    }
    $(".stat-box-county").html(template(params));
    params = {};


    // Selected
    params.topText = "SELECTED NPAs";
    if (metricUnits[m]) { params.mainUnits = metricUnits[m]; }
    if (metricUnits[getRaw(m)]) { params.rawUnits = metricUnits[getRaw(m)]; }
    // next do the main number. if it has a raw, aggregate, if not, sum.
    if (hasRaw(m)) {
        theStat = aggregateMean(_.filter(model.metric, function(el) { return model.selected.indexOf(el.id.toString()) !== -1; }),
            _.filter(model.metricRaw, function(el) { return model.selected.indexOf(el.id.toString()) !== -1; }));
        params.mainNumber = dataPretty(theStat[keys[model.year + 1]], m);
        if (metricSummable.indexOf(getRaw(m)) !== -1) {
            params.rawTotal = sum(_.pluck(_.filter(model.metricRaw, function(el) { return model.selected.indexOf(el.id.toString()) !== -1; }), keys[model.year + 1])).toFixed(0).commafy();
        }
    } else {
        params.mainNumber = dataPretty(sum(_.pluck(_.filter(model.metric, function(el) { return model.selected.indexOf(el.id.toString()) !== -1; }), keys[model.year + 1])), m);
    }
    $(".stat-box-neighborhood").html(template(params));

    // median
    theStat = median(_.map(model.metric, function(num){ if ($.isNumeric(num[keys[model.year + 1]])) { return Number(num[keys[model.year + 1]]); } }));
    $(".median").html(dataPretty(theStat, m));


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


// ****************************************
// Return whether raw exists based on filename
// If it's rX, no raw, if mX, there is one.
// ****************************************
function hasRaw(m) {
    if (m.indexOf("m") !== -1) {
        return true;
    } else {
        return false;
    }
}

// ****************************************
// Get the raw number for a metric
// ****************************************
function getRaw(m) {
    return "r" + m.match(/\d+/)[0];
}

// ****************************************
// Get the year
// ****************************************
function getYear(y) {
    return y.replace("y_","");
}
