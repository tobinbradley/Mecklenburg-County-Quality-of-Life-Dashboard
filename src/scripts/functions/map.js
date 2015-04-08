// ****************************************
// Zoom to polygons
// ****************************************
function d3ZoomPolys(msg, d) {
    var features = _.filter(d3Layer.toGeoJSON().features, function(data) { return _.contains(d.ids, data.id.toString()); });
    var bounds = L.latLngBounds(L.geoJson(features[0]).getBounds());
    _.each(features, function(feature) {
        bounds.extend(L.geoJson(feature).getBounds());
    });
    map.fitBounds(bounds);
}


// ****************************************
// Geocode a location or a neighborhood
// ****************************************
function geocode(d) {
    // add a marker if a point location is passed
    if (d.lat) {
        try { map.removeLayer(marker); }
        catch (err) {}
        marker = L.marker([d.lat, d.lng]).addTo(map);
    }

    // zoom to neighborhood
    var feature = _.filter(d3Layer.toGeoJSON().features, function(data) { return data.id === d.id; });
    var bounds = L.latLngBounds(L.geoJson(feature[0]).getBounds());
    map.fitBounds(bounds);
}


// ****************************************
// Style GeoJSON on load
// ****************************************
function jsonStyle(feature) {
    return {
          "fillColor": "rgba(0,0,0,0)",
          "color": "none",
          "fillOpacity": 1,
          className: "geom metric-hover",
    };
}


// ****************************************
// GeoJSON click event
// ****************************************
function onEachFeature(feature, layer) {
    layer.on({
        click: function() {
                    if(model.selected.indexOf(feature.id) !== -1) {
                        model.selected = _.difference(model.selected, [feature.id]);
                    } else {
                        model.selected = _.union(model.selected, [feature.id]);
                    }
                }
    });
}


// ****************************************
// Create the map
// ****************************************
function mapCreate() {
    L.Icon.Default.imagePath = './images';
    map = L.map("map", {
            attributionControl: false,
            touchZoom: true,
            minZoom: mapGeography.minZoom,
            maxZoom: mapGeography.maxZoom
        }).setView(mapGeography.center, mapGeography.defaultZoom);
    window.baseTiles = L.tileLayer(baseTilesURL);

    // full screen display button
    L.easyButton('glyphicon glyphicon-fullscreen', function (){
            map.setView(mapGeography.center, mapGeography.defaultZoom);
        },
        'Zoom to full extent'
    );

    // Add geolocation api control
    L.control.locate({
        icon: 'glyphicon glyphicon-map-marker locate-icon'
    }).addTo(map);

    // Year display
    var yearControl = L.control({position: 'bottomleft'});
    yearControl.onAdd = function(map) {
        this._div = L.DomUtil.create('div');
        this._div.innerHTML = '<h3 class="time-year"></h3>';
        return this._div;
    };
    yearControl.addTo(map);

    // make it so if scrolling on the page it disabled map zoom for a second
    $(window).on('scroll', function() {
        map.scrollWheelZoom.disable();
        setTimeout(function() { map.scrollWheelZoom.enable(); }, 1000);
    });

}


// ****************************************
// Initialize the D3 map layer
// ****************************************
function initMap() {
    // Load TopoJSON as geoJSON and set basic styling, classes, and click interaction
    d3Layer = L.geoJson(topojson.feature(model.geom, model.geom.objects[neighborhoods]), {
        style: jsonStyle,
        onEachFeature: onEachFeature
    }).addTo(map);

    // add data-id attribute to SVG objects.
    // the if-then is to handle non-contiguous polygon features (hi coastal areas!)
    d3Layer.eachLayer(function (layer) {
        if (layer._path) {
            layer._path.setAttribute("data-id", layer.feature.id);
        } else {
            layer.eachLayer(function (layer2) {
                layer2._path.setAttribute("data-id", layer.feature.id);
            });
        }
    });

    $(".geom").on({
        mouseenter: function(){
            addHighlight($(this));
        },
        mouseleave: function(){
            removeHighlight($(this));
        }
    });

    // Using D3 tooltips because I like them better. YMMV.
    $(".geom").tooltip({
        html: true,
        title: function() {
            var sel = $(this),
                num = "<br>N/A";
            if ($.isNumeric(sel.attr("data-value"))) {
                num = "<br>" + dataPretty(sel.attr("data-value"), $("#metric").val());
            }
            if (metricConfig[model.metricId].label) {
                num += "<br>" + metricConfig[model.metricId].label;
            }
            return "<p class='tip'><strong><span>" + neighborhoodDescriptor + " " + sel.attr("data-id") + "</strong>" + num + "</span></p>";
        },
        container: '#map'
    });

    // Here's where you would load other crap in your topojson for display purposes.
    // Change the styling here as desired.
    if (typeof overlay !== 'undefined') {
        geojson = L.geoJson(topojson.feature(model.geom, model.geom.objects[overlay]), {
            style: {
                "fillColor": "rgba(0,0,0,0)",
                "color": "white",
                "fillOpacity": 1,
                "opacity": 0.8,
                "weight": 3
            }
        }).addTo(map);
    }

    //  initialize neighborhood id's in typeahead
    polyid = _.map(model.geom.objects[neighborhoods].geometries, function(d){ return d.id.toString(); });

    // if neihborhoods are being passed from page load
    if (getURLParameter("n") !== "null") {
        var arr = [];
        _.each(getURLParameter("n").split(","), function(d) {
            arr.push(d);
        });
        model.selected = arr;
        d3ZoomPolys("", {"ids": arr});
    }
}


// ****************************************
// Color the map
// ****************************************
function drawMap() {

    var theGeom = d3.selectAll(".geom"),
        classlist = [],
        keys = Object.keys(model.metric[0]);

    // make list of color classes to remove
    for (i = 0; i < colorbreaks; i++) {
        classlist.push("q" + i);
    }

    theGeom.each(function() {
        var item = d3.select(this),
            theData = _.filter(model.metric, function(el) { return el.id == item.attr('data-id'); }),
            theValue = theData[0][keys[model.year + 1]],
            styleClass = "";

        if ($.isNumeric(theValue)) {
            styleClass = quantize(theValue);
        }

        item.classed(classlist.join(" "), false)
            .classed(styleClass, true)
            .attr("data-value", theValue)
            .attr("data-quantile", styleClass)
            .attr("data-toggle", "tooltip");
    });

}
