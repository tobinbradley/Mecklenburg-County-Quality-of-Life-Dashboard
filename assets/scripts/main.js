// ****************************************
// Global variables and settings
// ****************************************
var map,                // leaflet map
    quantize,           // d3 quantizer for color breaks
    x_extent,           // extent of the metric, including all years
    timer,              // timer for year slider
    barchartWidth,      // for responsive d3 barchart
    marker,             // marker for geocode
    d3Layer,            // the d3Layer on leaflet
    tour,               // I-don't-want-to-do-real-help thing
    numDecimals,          // number of significant decimals for metrics based on data
    recordHistory = false;  // stupid global toggle so it doesn't record page load metric etc. to google analytics

// lodash/underscore template desucking
_.templateSettings.variable = "rc";

// ****************************************
// Document Ready - kickoff
// ****************************************
$(document).ready(function () {

    // Start with random metric if none passed
    if (getURLParameter("m") !== "null") {
        $("#metric option[value='" + getURLParameter('m') + "']").prop('selected', true);
    }
    else {
        var $options = $('.chosen-select').find('option'),
            random = Math.floor((Math.random() * $options.length));
        $options.eq(random).prop('selected', true);
    }
    model.metricId =  $("#metric").val();

    // set window popstate handler
    if (history.pushState) {
        window.addEventListener("popstate", function(e) {
            if (getURLParameter("m") !== "null" && getURLParameter("m") !== model.metricId) {
                console.log("running metric popstate");
                recordHistory = false;
                model.metricId = getURLParameter('m');
            }
            if (getURLParameter("n") !== "null" && !model.selected.compare(getURLParameter("n").split(","))) {
                console.log("running n popstate");
                recordHistory = false;
                model.selected = getURLParameter("n").split(",");
            } else if (getURLParameter("n") === "null") {
                recordHistory = false;
                model.selected = [];
            }
        });
    }

    // launch report window with selected neighborhoods
    $("button.report-launch").on("click", function() {
        window.open("report.html?n=" + model.selected.join());
    });


    // Social media links
    $(".social-links a").on("click", function() {
        window.open($(this).data("url") + encodeURI(document.URL), "", "width=450, height=250");
    });

    // download table to csv
    // Because IE doesn't do DATA URI's for cool stuff, I'm using a little utility PHP file
    // on one of my servers. Feel free to use it, but if you want to host your own, the PHP
    // code is:
    // <?php
    // header("Content-type: application/octet-stream");
    // header("Content-Disposition: attachment; filename=\"my-data.csv\"");
    // $data=stripcslashes($_REQUEST['csv_text']);
    // echo $data;
    // ?>
    $('.table2CSV').on('click', function() {
        var csv = $(".datatable-container table").table2CSV({
                delivery: 'value'
            });
        var theMetric = $("#metric option:selected");
        window.location.href = 'http://mcmap.org/utilities/table2csv.php?csv_text=' + encodeURIComponent(csv) + '&filename=' + encodeURIComponent(theMetric.text().trim());
    });

    // chosen - the uber select list
    $(".chosen-select").chosen({width: '100%', no_results_text: "Not found - "}).change(function () {
        model.metricId = $(this).val();
        $(this).trigger("chosen:updated");
    });
    $(".chosen-search input").prop("placeholder", "search metrics");
    $(".chosen-select").removeClass("hide");  // just in case it's mobile

    // Time slider and looper. Shouldn't require this much code. Curse my stupid brains.
    $(".slider").slider({
        value: 1,
        min: 0,
        max: 1,
        step: 1,
        animate: true,
        slide: function( event, ui ) {
            model.year = ui.value;
        }
    });
    $(".btn-looper").on("click", function () {
        var that = $(this).children("span");
        var theSlider = $('.slider');
        if (that.hasClass("glyphicon-play")) {
            that.removeClass("glyphicon-play").addClass("glyphicon-pause");
            if (theSlider.slider("value") === theSlider.slider("option", "max")) {
                theSlider.slider("value", 0);
            }
            else {
                theSlider.slider("value", theSlider.slider("value") + 1);
            }
            model.year = theSlider.slider("value");
            timer = setInterval(function () {
                    if (theSlider.slider("value") === theSlider.slider("option", "max")) {
                        theSlider.slider("value", 0);
                    }
                    else {
                        theSlider.slider("value", theSlider.slider("value") + 1);
                    }
                    model.year = theSlider.slider("value");
                }, 3000);
        }
        else {
            that.removeClass("glyphicon-pause").addClass("glyphicon-play");
            clearInterval(timer);
        }
    });

    // Don't let clicked toggle buttons remain colored because ugly
    $(".datatoggle").on("focus", "button", function() { $(this).blur(); });

    // Clear selected button.
    $(".select-clear").on("click", function() {
        model.selected = [];
    });

    // Toggle the nerd table
    $(".toggle-table").on("click", function() {
        var txt = $(".datatable-container").is(':visible') ? 'Show Data' : 'Hide Data';
        $(this).text(txt);
        $(".datatable-container").toggle("slow");
    });

    // Toggle the map, making polys less opaque and activating a base layer.
    $(".toggle-map").on("click", function() {
        var txt = $(this).text() === "Hide Map" ? 'Show Map' : 'Hide Map';
        if (txt !== "Show Map") {
            $(".geom").css("fill-opacity", "0.4");
            $(".leaflet-overlay-pane svg path:not(.geom)").css("stroke-opacity", "0");
            map.addLayer(baseTiles);
        } else {
            $(".geom").css("fill-opacity", "1");
            $(".leaflet-overlay-pane svg path:not(.geom)").css("stroke-opacity", "0.6");
            map.removeLayer(baseTiles);
        }
        $(this).text(txt);
    });

    // Set up Tourbus for noob assistance
    var tour = $('#dashboard-tour').tourbus({ onStop: function( tourbus ) {$("html, body").animate({ scrollTop: 0 }, "slow");} });
    $('.btn-help').on("click", function() {
        tour.trigger('depart.tourbus');
    });

    // Use Google Analytics to track outbound resource links.
    $(".meta-resources").on("mousedown", "a", function(e){
        if (window.ga && e.which !== 3) {
            ga('send', 'event', 'resource', $(this).text().trim(), $("#metric option:selected").text().trim());
        }
    });

    // Contact form. You'll want to send this someplace else.
    $(".contact form").submit(function(e) {
        e.preventDefault();
        $(".contact").dropdown("toggle");
        // send feedback
        if ($("#message").val().trim().length > 0) {
            $.ajax({
                type: "POST",
                url: "/utilities/feedback.php",
                data: {
                    email: $("#email").val(),
                    url: window.location.href,
                    agent: navigator.userAgent,
                    subject: "Quality of Life Dashboard Feedback",
                    to: "tobin.bradley@gmail.com",
                    message: $("#message").val()
                }
            });
        }
    });
    $('.dropdown .contact input').click(function(e) {
        e.stopPropagation();
    });

    // Set up the map
    mapCreate();

    // initialize the bar chart
    valueChart = barChart();

    // Window resize listener so the bar chart can be responsive
    d3.select(window).on("resize", function () {
        if ($(".barchart").parent().width() !== barchartWidth) {
            drawBarChart();
        }
    });

    // Get the data and kick everything off
    fetchMetricData(model.metricId);

});
