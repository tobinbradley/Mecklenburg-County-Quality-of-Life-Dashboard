var FTmeta,
    activeRecord = {},
    defaultMeasure = 'p1',
    activeMeasure = defaultMeasure,
    wsbase = 'http://maps.co.mecklenburg.nc.us/rest/',
    map,
    geojson,
    jsonData,
    info,
    legend,
    marker,
    chart;

$(document).ready(function () {

    // Load variable metadata JSON
    $.ajax({
        url: 'data/metrics.json?V=23',
        dataType: 'json',
        async: false,
        success: function (data) {
            FTmeta = data;
        }
    });

    // Load NPA GeoJSON
    $.ajax({
        url: 'data/npa.json?V=23',
        dataType: 'json',
        type: 'GET',
        async: false,
        success: function (data) {
            jsonData = data;
        }
    });

    // Placeholder extension for crap browsers
    $('input, textarea').placeholder();

    // report event handlers
    $('#report_metrics optgroup').click(function (e) { $(this).children().prop('selected', 'selected');  });
    $('#report_metrics optgroup option').click(function (e) { e.stopPropagation(); });
    $('#all_metrics').change(function () {
        $(this).is(':checked') ? $('#report_metrics optgroup option').prop('selected', 'selected') : $('#report_metrics optgroup option').prop('selected', false);
    });

    // Set default metric display
    updateData(FTmeta[defaultMeasure]);
    calcAverage(defaultMeasure);
    barChart(FTmeta[defaultMeasure]);
    $('a[data-measure=' + defaultMeasure + ']').children('i').addClass('icon-active');

    // Sidebar events
    $('a.measure-link').on('click', function (e) {
        $('a.measure-link').children('i').removeClass('icon-active');
        $(this).children('i').addClass('icon-active');
        if ($(window).width() <= 767) { $('html, body').animate({ scrollTop: $('#data').offset().top }, 1000); }
        changeMeasure($(this).data('measure'));
        e.stopPropagation();
    });
    $('.sidenav li ul').on('click', function (e) { e.stopPropagation(); });
    $('.sidenav li.metrics-dropdown').on('click', function () {
        $(this).addClass('active').siblings().removeClass('active');
        $(this).siblings().children('ul').each(function () {
            if (!$(this).is(':hidden')) { $(this).animate({ height: 'toggle' }, 250); }
        });
        $(this).children('ul').animate({ height: 'toggle' }, 250);
    });
    $('#metrics-select').change(function () {
        changeMeasure($(this).val());
    });

    // Modal events
    $(".talkback").click(function () {
        $('#modalHelp').modal('hide');
        $('#modalTalkback').modal('show');
    });
    $(".reports").click(function () {
        $('#modalData').modal('hide');
        $('#modalReport').modal('show');
    });
    $(".reportToData").click(function () {
        $('#modalReport').modal('hide');
        $('#modalData').modal('show');
    });

    // Geolocation
    if (!Modernizr.geolocation) {
        $(".gpsarea").hide();
    } else {
        $(".gps").click(function () {
            map.locate({ enableHighAccuracy: true });
        });
    }

    // popover events
    $('*[rel=popover]').popover();
    $(".popover-trigger").hover(function () {
            if ($(window).width() > 979) { $($(this).data("popover-selector")).popover("show"); }
        }, function () {
            $($(this).data("popover-selector")).popover("hide");
        }
    );

    // Window resize for SVG charts
    $(window).smartresize(function () {
        // charts
        if ($("#details_chart svg").width() !== $("#data").width()) { barChart(FTmeta[activeMeasure]); }
    });



    // Feedback from submit
    $("#talkback").submit(function (e) {
        e.preventDefault();
        $('#modalTalkback').modal('hide');
        $.ajax({
            type: "POST",
            url: "php/feedback.php",
            data: { inputName: $("#inputName").val(), inputEmail: $("#inputEmail").val(), inputURL: window.location.href, inputFeedback: $("#inputFeedback").val() }
        });
    });

    // jQuery UI Autocomplete
    $("#searchbox").click(function () { $(this).select(); });
    $.widget("custom.catcomplete", $.ui.autocomplete, {
        _renderMenu: function(ul, items) {
            var that = this,
                currentCategory = "";
            $.each(items, function(index, item) {
                if (item.responsetype !== currentCategory) {
                    ul.append("<li class='ui-autocomplete-category'>" + item.responsetype + "</li>");
                    currentCategory = item.responsetype;
                }
                that._renderItemData(ul, item);
            });
        }
    });
    $("#searchbox").catcomplete({
        minLength: 1,
        delay: 250,
        autoFocus: true,
        source: function (request, response) {
            if (request.term.length > 3) {
                $.ajax({
                    url: wsbase + 'v4/ws_geo_ubersearch.php',
                    dataType: 'jsonp',
                    data: {
                        searchtypes: 'address,library,school,park,geoname,cast,nsa,intersection,pid,business,road',
                        query: request.term
                    },
                    success: function (data) {
                        if (data.length > 0) {
                            response($.map(data, function (item) {
                                return {
                                    label: item.name,
                                    gid: item.gid,
                                    responsetype: item.type,
                                    lng: item.lng,
                                    lat: item.lat
                                };
                            }));
                        } else {
                            response($.map([{}], function (item) {
                                if (isNumber(request.term)) {
                                    // Needs more data
                                    return { label: 'More information needed for search.', responsetype: "I've got nothing" };
                                } else {
                                    // No records found
                                    return { label: "No records found.", responsetype: "I've got nothing" };
                                }
                            }));
                        }
                    }
                });
            }
            else {
                $.ajax({
                    url: wsbase + "v2/ws_geo_attributequery.php",
                    dataType: "jsonp",
                    data: {
                        table: "neighborhoods_data",
                        fields: "id as gid, id as name, 'NPA' as type",
                        parameters: "id = " + request.term
                    },
                    success: function (data) {
                        if (data.length > 0) {
                            response($.map(data, function (item) {
                                return {
                                    label: item.name,
                                    gid: item.gid,
                                    responsetype: item.type
                                };
                            }));
                        } else {
                            response($.map([{}], function (item) {
                                return { label: "No records found. I might need more information.", responsetype: "I've got nothing" };
                            }));
                        }
                    }
                });
            }
        },
        select: function (event, ui) {
            if (ui.item.lat) {
                locationFinder(ui.item);
            }
            else if (ui.item.gid) {
                changeNeighborhood(ui.item.gid);
            }
            $(this).popover('hide').blur();
        },
        open: function (event, ui) {
            $(this).popover('hide');
        }
    });
    $(".searchbtn").bind("click", function (event) {
        $("#searchbox").catcomplete("search");
    });

});

/*
    Window load events
 */
$(window).load(function () {
    // load map
    mapInit();

    // Process any legacy hash, if not process arguments
    // burn this out layer
    if (window.location.hash.length > 1) {
        hashRead();
    }
    else {
        historyNav();
    }

    // set up history API
    if (Modernizr.history) {
        // history is supported; do magical things
        $(window).bind("popstate", function () {
            // reset if no args
            if (!getURLParameter("npa") && !getURLParameter("variable")) {
                $(".measure-info").hide();
                activeRecord = {};
                barChart(FTmeta[activeMeasure]);
                geojson.setStyle(style);
                map.setView([35.260, -80.807], 10);
            }
            else {
                historyNav();
            }
        });
    }

    // set up report dialog metric content
    $('#report_metrics').html($('#metrics-select').html());
});


/*
    Read args on load and popstate
*/
function historyNav() {
    // run neighborhood
    if (getURLParameter("npa")) {
        changeNeighborhood(getURLParameter("npa"), false);
    }
    // run variable
    if (getURLParameter("variable")) {
        changeMeasure(getURLParameter("variable"), false);
    }
}


/*
    Hash reading and writing
    burn this out later
*/
function hashRead() {
    theHash = window.location.hash.replace("#", "").split("/");

    // Process the neighborhood number
    if (theHash[2] && theHash[2].length > 0) {
        if (theHash[2].indexOf(",") === -1) {
            changeNeighborhood(theHash[2], true);
        }
    }
    // Process the metric
    if (theHash[1].length > 0) {
        changeMeasure(theHash[1]);
    }
    // clear out old hash nonsense
    window.location.hash = "";
}

/*
    Change active measure
*/
function changeMeasure (measure, setHistory) {
    if (typeof(setHistory) === 'undefined') { setHistory = true; }
    activeMeasure = measure;

    // activate sidebar etc. if not already there
    if ($('a[data-measure=' + measure + ']').parent("li").parent("ul").is(':hidden') && $('.sidenav').is(':visible')) {
        $('a[data-measure=' + measure + ']').parent("li").parent("ul").parent("li").trigger("click");
    }
    if (!$('a[data-measure=' + measure + ']').children("i").hasClass("icon-active")) {
        $("a.measure-link").children("i").removeClass("icon-active");
        $('a[data-measure=' + measure + ']').children("i").addClass("icon-active");
    }

    // get average if haven't already
    if (!FTmeta[activeMeasure].style.avg) { calcAverage(activeMeasure); }
    geojson.setStyle(style);
    legend.update();
    info.update();
    var layer = getNPALayer(activeRecord.id);
    updateData(FTmeta[activeMeasure]);
    if (activeRecord.id) { highlightSelected(layer); }

    // pushstate
    if (Modernizr.history && setHistory) {
        history.pushState(null, null, "?npa=" + (activeRecord["id"] ? activeRecord["id"] : "") + "&variable=" + activeMeasure);
    }

    // set phone select dropdown
    $('#metrics-select').val(measure);

}

/*
    Change active neighborhood
*/
function changeNeighborhood (npaid, setHistory) {
    if (typeof(setHistory) === 'undefined') { setHistory = true; }
    var layer = getNPALayer(npaid);
    assignData(layer.feature.properties);
    $(".measure-info").show();
    updateData(FTmeta[activeMeasure]);
    highlightSelected(layer);
    $('#report_neighborhood').val(npaid);
    zoomToFeature(layer.getBounds());

    // pushstate
    if (Modernizr.history && setHistory) {
        history.pushState(null, null, "?npa=" + (activeRecord["id"] ? activeRecord["id"] : "") + "&variable=" + activeMeasure);
    }

}

/*
    Assign data to active record
 */
function assignData(data) {
    $.each(data, function (key, value) {
        activeRecord[key] = value;
    });
}


/*
    Update detailed data
*/
function updateData(measure) {
    if (activeRecord.id) {
        $("#selectedNeighborhood").html("Neighborhood Profile Area " + activeRecord.id);
        $("#selectedValue").html(prettyMetric(activeRecord[measure.field], activeMeasure));
    }
    barChart(measure);

    // set neighborhood overview
    $("#selectedMeasure").html(measure.title);
    $("#indicator_description").html(measure.description);

    // set details info
    $("#indicator_why").html(measure.importance);
    $("#indicator_technical").empty();
    if (measure.tech_notes && measure.tech_notes.length > 0) {
        $("#indicator_technical").append('<p>' + measure.tech_notes + '</p>');
    }
    if (measure.source && measure.source.length > 0) {
        $("#indicator_technical").append('<p>' + measure.source + '</p>');
    }
    $("#indicator_resources").empty();
    if (measure.links) {
        $("#indicator_resources").append(measure.links);
    }

}

/*
    Bar Chart
*/
function barChart(measure) {
    var data, theTitle, theColors;
    if (jQuery.isEmptyObject(activeRecord) || activeRecord[activeMeasure] === null) {
        data = google.visualization.arrayToDataTable([
            ["", 'County Average'],
            ["",  FTmeta[measure.field].style.avg ]
        ]);
        theTitle = prettyMetric(Math.round(FTmeta[measure.field].style.avg), activeMeasure);
        theColors = ["#DC3912"];
    }
    else {
        data = google.visualization.arrayToDataTable([
            ["", 'NPA ' + activeRecord.id, 'County Average'],
            ["",  parseFloat(activeRecord[measure.field]), Math.round(FTmeta[measure.field].style.avg) ]
        ]);
        theTitle = prettyMetric(activeRecord[measure.field], activeMeasure);
        theColors = ["#0283D5", "#DC3912"];
    }

    var options = {
        title: theTitle,
        titlePosition: 'out',
        titleTextStyle: { fontSize: 14 },
        //vAxis: { title: null,  titleTextStyle: {color: 'red'}},
        hAxis: { format: "#.##", minValue: FTmeta[measure.field].style.breaks[0] },
        width: "95%",
        height: 150,
        legend: 'bottom',
        colors: theColors,
        chartArea: { left: 20, right: 20, width: '100%' }
    };

    if (!chart) { chart = new google.visualization.BarChart(document.getElementById('details_chart')); }
    chart.draw(data, options);
}





