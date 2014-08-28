globals.precinctName = function(id) {
  return precincts[id];
}

_.templateSettings.variable = "rc";

PubSub.immediateExceptions = true; // set to false in production

String.prototype.commafy = function () {
    return this.replace(/(^|[^\w.])(\d{4,})/g, function($0, $1, $2) {
        return $1 + $2.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,");
    });
};
Number.prototype.commafy = function () {
    return String(this).commafy();
};

// Detect placeholder support for IE9
jQuery.support.placeholder = (function(){
    var i = document.createElement('input');
    return 'placeholder' in i;
})();

globals.getURLParameter = function(name) {
    return decodeURI(
        (new RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}

var setup = {
  loadPrecinctNames: function() {
    $.getJSON('data/precincts.geojson', function(precinctJson) {
      _.each(precinctJson.features, function(feature) {
        precincts[feature.properties.OBJECTID - 1] = feature.properties.NAME;
      });
    });
  },
  initPubSub: function() {
    // pubsub subscriptions
    PubSub.subscribe('initialize', globals.initMap);
    // PubSub.subscribe('initialize', initTypeahead);
    PubSub.subscribe('changeYear', globals.setExtent);
    PubSub.subscribe('changeYear', globals.drawMap);
    PubSub.subscribe('changeYear', drawBarChart);
    PubSub.subscribe('changeYear', updateTable);
    PubSub.subscribe('changeYear', updateCountyStats);
    PubSub.subscribe('changeMetric', globals.processMetric);
    PubSub.subscribe('changeMetric', globals.drawMap);
    PubSub.subscribe('changeMetric', drawBarChart);
    PubSub.subscribe('changeMetric', drawLineChart);
    PubSub.subscribe('changeMetric', updateMeta);
    PubSub.subscribe('changeMetric', updateTable);
    PubSub.subscribe('changeMetric', updateCountyStats);
    PubSub.subscribe('recordHistory', globals.recordMetricHistory);
    PubSub.subscribe('selectGeo', d3Select);
    PubSub.subscribe('geocode', d3Select);
    PubSub.subscribe('geocode', d3Zoom);
    PubSub.subscribe('geocode', addMarker);
    PubSub.subscribe('findNeighborhood', d3Select);
    PubSub.subscribe('findNeighborhood', d3Zoom);
  },
  loadMetricFromUrl: function() {
    // Start with random metric if none passed
    if (globals.getURLParameter('m') !== 'null') {
      $("#js-category li[data-category='" + globals.getURLParameter('m') + "']").addClass('active');
    }
    else {
      var $options = $('#js-category').find('li'),
        random = Math.floor((Math.random() * $options.length));
      $options.eq(random).addClass('active');
      $('.chosen-select').find('option').eq(random).prop('selected', true);
    }
  },
  initPushstate: function() {
    // set window popstate event
    if (history.pushState) {
      window.addEventListener("popstate", function(e) {
        if (globals.getURLParameter("m") !== "null") {
          PubSub.unsubscribe(recordMetricHistory);
          $("#metric option[value='" + globals.getURLParameter('m') + "']").prop('selected', true);
          $('#metric').chosen().change();
          PubSub.subscribe("recordHistory", recordMetricHistory);
        }
      });
    }
  },
  initChosen: function() {
    // chosen
    $(".chosen-select").chosen({width: '100%', no_results_text: "Not found - "}).change(function () {
      var theVal = $(this).val();
      fetchMetricData(theVal);
      $(this).trigger("chosen:updated");
      PubSub.publish("recordHistory", {});
    });
    $(".chosen-search input").prop("placeholder", "search metrics");
  },
  initMapToggles: function() {
    // Don't let clicked toggle buttons remain colored
    $(".datatoggle").on("focus", "button", function() { $(this).blur(); });

    // Clear selected button
    $(".select-clear").on("click", function() {
      d3.selectAll(".geom").classed("d3-select", false);
      d3.select(".value-select").selectAll("rect, line, text, circle").remove();
      d3.selectAll(".trend-select").selectAll("path, circle").remove();
      $(".datatable-container tbody tr").remove();
      $(".stats-selected").text("N/A");
      try { map.removeLayer(marker); }
      catch (err) {}
    });

    // Toggle table button
    $(".toggle-table").on("click", function() {
      var txt = $(".datatable-container").is(':visible') ? 'Show Data' : 'Hide Data';
      $(this).text(txt);
      $(".datatable-container").toggle("slow");
    });

    // Toggle map button
    $(".toggle-map").on("click", function() {
      var txt = $(this).text() === "Show Map" ? 'Hide Map' : 'Show Map';
      if (txt !== "Hide Map") {
        $(".geom").css("fill-opacity", "1");
        $(".leaflet-overlay-pane svg path:not(.geom)").css("stroke-opacity", "1");
        map.removeLayer(baseTiles);
      } else {
        $(".geom").css("fill-opacity", "0.7");
        $(".leaflet-overlay-pane svg path:not(.geom)").css("stroke-opacity", "0.6");
        map.addLayer(baseTiles);
      }
      $(this).text(txt);
    });
  },
  initTour: function() {
    // joyride
    var tour = $('#dashboard-tour').tourbus({});
    $('.btn-help').on("click", function() {
        tour.trigger('depart.tourbus');
    });
  },
  initMap: function() {
    // set up map
    L.Icon.Default.imagePath = './images';
    map = L.map("map", {
            attributionControl: false,
            touchZoom: true,
            minZoom: mapGeography.minZoom,
            maxZoom: mapGeography.maxZoom,
            scrollWheelZoom: false
        }).setView(mapGeography.center, mapGeography.defaultZoom);
    var baseTiles = L.tileLayer(baseTilesURL).addTo(map);

    // Year control
    var yearControl = L.control({position: 'bottomright'});
    yearControl.onAdd = function(map) {
        this._div = L.DomUtil.create('div', 'yearDisplay time text-right');
        this._div.innerHTML = '<h3 class="time-year">2012</h3><button type="button" class="btn btn-primary btn-looper"><span class="glyphicon glyphicon-play"></span></button><div class="slider"></div>';
        return this._div;
    };
    yearControl.addTo(map);
  },
  setupSlider: function() {
    // Slider change event - year-over-year
    var sliderChange = function(value) {
      $('.time-year').text(metricData[value].year.replace("y_", ""));
      year = value;
      PubSub.publish('changeYear');
    }

    // time slider and looper
    $(".slider").slider({
      value: 1,
    min: 0,
    max: 1,
    step: 1,
    animate: true,
    slide: function( event, ui ) {
      sliderChange(ui.value);
    }
    });
    $(".btn-looper").on("click", function () {
      var that = $(this).children("span");
      var theSlider = $('.slider');
      var timer;
      if (that.hasClass("glyphicon-play")) {
        that.removeClass("glyphicon-play").addClass("glyphicon-pause");
        if (theSlider.slider("value") === theSlider.slider("option", "max")) {
          theSlider.slider("value", 0);
        }
        else {
          theSlider.slider("value", theSlider.slider("value") + 1);
        }
    sliderChange(theSlider.slider("value"));
    timer = setInterval(function () {
      if (theSlider.slider("value") === theSlider.slider("option", "max")) {
        theSlider.slider("value", 0);
      }
      else {
        theSlider.slider("value", theSlider.slider("value") + 1);
      }
    sliderChange(theSlider.slider("value"));
    }, 3000);
      }
      else {
        that.removeClass("glyphicon-pause").addClass("glyphicon-play");
        clearInterval(timer);
      }
    });
  },
  trackOutboundLinks: function() {
    // Track outbound resource links
    $(".meta-resources").on("mousedown", "a", function(e){
        if (window.ga && e.which !== 3) {
            ga('send', 'event', 'resource', $(this).text().trim(), $("#metric option:selected").text().trim());
        }
    });
  },
  initMetricNav: function() {
    $("#js-category li").on("click",function(){
        $("#js-category li").removeClass("active");
        $(this).addClass("active");
        var theVal = $(this).data("category");
        fetchMetricData(theVal);
        $(".chosen-select").val(theVal).trigger("chosen:updated");
    });
  },
};

globals.draw = function(geom) {
    PubSub.publish('initialize', {
        "geom": geom
    });
}

globals.changeMetric = function(data) {
    var theVal = $("#metric").val();
    $(".d3-tip").remove();
    PubSub.publish('changeMetric', {
        'metricdata': data,
        'metric': theVal
    });
}

globals.setExtent = function(msg, data) {
    var extentArray = [];
    // Shows distribution by year instead of by total
    extentArray = extentArray.concat(metricData[year].map.values());
    // _.each(metricData, function(d) { console.log(d); debugger; extentArray = extentArray.concat(d.map.values()); });
    x_extent = d3.extent(extentArray);
}

globals.processMetric = function(msg, data) {
    // get current year if available so slider can find nearest
    if (_.isNumber(year)) {
        var prevYear = parseInt(metricData[year].year.replace("y_", ""));
    }

    // clear metric data
    metricData.length = 0;

    var keys = Object.keys(data.metricdata[0]);
    for (var i = 1; i < keys.length; i++) {
        metricData.push({"year": keys[i], "map": d3.map()});
    }

    // set slider and time related stuff - month-over-month
    // year = 41; // months numbered with January 2011 as 0, so 41 represents June 2014
    // $(".slider").slider("option", "max", metricData.length - 1).slider("value", year);
    // metricData.length > 1 ? $(".time").fadeIn() : $(".time").hide();
    // $('.time-year').text(nameMonth(metricData[year].year));

    // _.each(data.metricdata, function (d) {
    //     for (var i = 0; i < metricData.length; i++) {
    //         if ($.isNumeric(d[metricData[i].year])) { metricData[i].map.set(d.id, parseFloat(d[metricData[i].year])); }
    //     }
    // });

    // set slider and time related stuff - year-over-year
     year = metricData.length -1;
     $(".slider").slider("option", "max", metricData.length - 1).slider("value", year);
     metricData.length > 1 ? $(".time").fadeIn() : $(".time").hide();
     $('.time-year').text(metricData[year].year.replace("y_", ""));

     _.each(data.metricdata, function (d) {
         for (var i = 0; i < metricData.length; i++) {
             if ($.isNumeric(d[metricData[i].year])) { metricData[i].map.set(d.id, parseFloat(d[metricData[i].year])); }
         }
     });

    // Set up x_extent
    globals.setExtent();

    // set up quantile
    quantize = d3.scale.quantile()
        .domain(x_extent)
        .range(d3.range(colorbreaks).map(function (i) {
            return "q" + i;
        }));
}

globals.recordMetricHistory = function(msg, data) {
    // push metric to GA and state
    // Note I'm doing the text descript, not the little name, for clarity in analytics
    if (msg !== 'initialize') {
        if (history.pushState) {
            history.pushState({myTag: true}, null, "?m=" + $("#metric").val());
        }
        if (window.ga) {
            theMetric = $("#metric option:selected");
            ga('send', 'event', 'metric', theMetric.text().trim(), theMetric.parent().prop("label"));
        }
    }
}

$(document).ready(function () {

    setup.loadPrecinctNames();
    setup.initPubSub();
    // setup.loadMetricFromUrl();
    // setup.initPushstate();
    setup.initChosen();
    setup.initMapToggles();
    setup.initTour();
    // setup.trackOutboundLinks();

    setup.initMap();
    setup.setupSlider();

    // initialize charts
    trendChart = lineChart();
    valueChart = barChart();

    // window resize so charts change
    d3.select(window).on("resize", function () {
        if ($(".barchart").parent().width() !== barchartWidth) {
            drawBarChart();
            drawLineChart();
        }
    });

    // kick everything off
    fetchMetricData($("#metric").val());
    setup.initMetricNav();
});

