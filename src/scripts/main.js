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
    recordHistory = false;  // stupid global toggle so it doesn't record page load metric etc. to google analytics

// ****************************************
// The One Model of Sauron. Change this and Frodo dies.
// ****************************************
var model = {
    "selected": []
};

// lodash/underscore template desucking
_.templateSettings.variable = "rc";

// ****************************************
// Document Ready - kickoff
// ****************************************
$(document).ready(function () {

    // load metrics
    var selectVals = '',
        selectGroup = '';
    _.each(metricConfig, function(el, key) {
        if (el.category === selectGroup) {
            selectVals += '<option value="' + key + '">' + el.title + '</option>';
        } else {
            if (selectVals.length > 0) { selectVals += '</optgroup>'; }
            selectVals += '<optgroup label="' + el.category + '">';
            selectVals += '<option value="' + key + '">' + el.title + '</option>';
            selectGroup = el.category;
        }
    });
    selectVals += '</optgroup>';
    document.querySelector("#metric").innerHTML = selectVals;
    $('#metric').hover(function() {
        $(this).removeClass('select-highlight');
    });

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

    // data select
    $(".chosen-select").on("change", function() {
        model.metricId = $(this).val();
    });

    // set window popstate handler
    if (history.pushState) {
        window.addEventListener("popstate", function(e) {
            if (getURLParameter("m") !== "null" && getURLParameter("m") !== model.metricId) {
                recordHistory = false;
                model.metricId = getURLParameter('m');
            }
            if (getURLParameter("n") !== "null" && !model.selected.compare(getURLParameter("n").split(","))) {
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
    $('body').on('click', '.table2CSV', function() {
        var csv = $(".datatable-container table").table2CSV({ delivery: 'value' });
        $("#csv_text").val(csv);
        $("#filename").val($("#metric [value='" + model.metricId + "']").text().trim());
    });


    // Time slider and looper. Seems like a lot of code for this. Curse my stupid brains.
    $(".slider").slider({
        value: 1,
        min: 0,
        max: 1,
        step: 1,
        animate: true,
        slide: function( event, ui ) {
            model.year = ui.value;
            changeYear();
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
            changeYear();
            timer = setInterval(function () {
                    if (theSlider.slider("value") === theSlider.slider("option", "max")) {
                        theSlider.slider("value", 0);
                    }
                    else {
                        theSlider.slider("value", theSlider.slider("value") + 1);
                    }
                    model.year = theSlider.slider("value");
                    changeYear();
                }, 3000);
        }
        else {
            that.removeClass("glyphicon-pause").addClass("glyphicon-play");
            clearInterval(timer);
        }
    });

    // Don't let clicked toggle buttons remain colored because ugly
    $(".datatoggle").on("focus", "button", function() { $(this).blur(); });

    // Scroll to begin position (i.e. get past and then nuke jumbotron)
    $(".scrollToStart").on("click", function() {
        var pos = $(".container-content").position().top - $(".navbar").height();
        $('html, body').animate({ scrollTop: pos}, 'slow', function() {
            $('.jumbotron').remove();
            $(window).scrollTop(0);
            $('.navbar').addClass('navbar-color');
            $(".chosen-select").addClass("select-highlight");
        });
    });

    // Clear selected button.
    $(".select-clear").on("click", function() {
        model.selected = [];
    });

    // Now to put in some popover definitions. I hate popover definitions, but I am just a cog in the machine. The
    // really crappy machine.
    $('body').popover({
        selector: '[data-toggle=popover]',
        "placement": "auto",
        "trigger": "focus",
        "container": "body"
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

    // Contact form. You'll want to send this someplace else via config.js
    $(".contact form").submit(function(e) {
        e.preventDefault();
        $(".contact").dropdown("toggle");
        if ($("#message").val().trim().length > 0) {
            $.ajax({
                type: "POST",
                url: contactConfig.url,
                data: {
                    email: $("#email").val(),
                    url: window.location.href,
                    agent: navigator.userAgent,
                    subject: "Quality of Life Dashboard Feedback",
                    to: contactConfig.to,
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
            // set up data quantile from extent
            quantize = d3.scale.quantile()
                .domain(x_extent)
                .range(d3.range(colorbreaks).map(function (i) {
                    return "q" + i;
                }));
            drawBarChart();
        }
    });

    // ****************************************
    // Initialize the observer
    // ****************************************
    Object.observe(model, function(changes) {
        modelChanges(changes);
    });

    // Get the data and kick everything off
    fetchMetricData(model.metricId);

    // turn on form labels if placeholder not supported - curse you IE9
    if (!('placeholder' in document.createElement('input'))) {
        $("label").removeClass("sr-only");
    }

});
