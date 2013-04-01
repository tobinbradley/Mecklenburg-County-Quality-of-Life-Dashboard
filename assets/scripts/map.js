/********************************************
    Map Stuff
********************************************/
function mapInit() {

    // initialize map
    map = new L.Map('map', {
        center: [35.260, -80.807],
        zoom: 10,
        minZoom: 9,
        maxZoom: 16
    });
    map.attributionControl.setPrefix(false).setPosition("bottomleft");

    // Opacity slider
    var myslider = L.control({position: 'bottomleft'});
    myslider.onAdd = function(map) {
        this._div = L.DomUtil.create('div', 'myslider');
        this._div.innerHTML = '<div id="opacity_slider"></div>';
        return this._div;
    };
    myslider.addTo(map);
    $("#opacity_slider").slider({ orientation: "vertical", range: "min", value: 80, min: 25, max: 100, stop: function (event, ui) {
            map.dragging.enable()
            geojson.setStyle(style);
            if (activeRecord.id) { highlightSelected(getNPALayer(activeRecord.id)); }
            legend.update();
        },
        start: function(event, ui) { map.dragging.disable(); }
    }).sliderLabels('Map', 'Data');



    //  Add Base Layer
    L.tileLayer( "http://maps.co.mecklenburg.nc.us/mbtiles/mbtiles-server.php?db=meckbase-desaturated.mbtiles&z={z}&x={x}&y={y}",
     { "attribution": "<a href='http://emaps.charmeck.org'>Mecklenburg County GIS</a>" } ).addTo( map );

    // Add geojson data
    geojson = L.geoJson(jsonData, { style: style, onEachFeature: onEachFeature }).addTo(map);

    // Locate user position via GeoLocation API
    map.on('locationfound', function(e) {
        var radius = e.accuracy / 2;
        performIntersection(e.latlng.lat, e.latlng.lng);
    });

    // Hover information
    info = L.control();
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };
    info.update = function (props) {
        this._div.innerHTML = '<h4>' + FTmeta[activeMeasure].title + '</h4>' +  (props && props[activeMeasure] != undefined ?
            'NPA ' + props.id + ': ' + prettyMetric(props[activeMeasure], activeMeasure) + '<br>County Average: ' + prettyMetric(FTmeta[activeMeasure].style.avg, activeMeasure) :
            props && props[activeMeasure] == undefined ? 'NPA ' + props.id + '<br />No data available.' :
            '');
    };
    info.addTo(map);

    // Legend
    legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info legend');
        this.update();
        return this._div;
    };
    legend.update = function() {
        var theLegend = '<i style="background: #666666; opacity: ' + ($("#opacity_slider").slider( "option", "value" ) + 10) / 100 + '"></i> <span id="legend-">N/A</span><br>';
        $.each(FTmeta[activeMeasure].style.breaks, function(index, value) {
            theLegend += '<i style="background:' + FTmeta[activeMeasure].style.colors[index] + '; opacity: ' + ($("#opacity_slider").slider( "option", "value" ) + 10) / 100 + '"></i> <span id="legend-' + index + '">' +
                prettyMetric(value, activeMeasure)  + (FTmeta[activeMeasure].style.colors[index + 1] ? '&ndash;' + prettyMetric(FTmeta[activeMeasure].style.breaks[index + 1], activeMeasure) + '</span><br>' : '+</span>');
        });
        this._div.innerHTML = theLegend;
    };
    legend.addTo(map);


}

/* zoom to bounds */
function zoomToFeature(bounds) {
    map.fitBounds(bounds);
}

/*
    Add marker
*/
function addMarker(lat, lng) {
    if (marker) {
        try { map.removeLayer(marker); }
        catch(err) {}
    }
    marker = L.marker([lat, lng]).addTo(map);
}

/*
    Get xy NPA intersection via web service
*/
function performIntersection(lat, lon) {
    url = wsbase + 'v1/ws_geo_pointoverlay.php?geotable=neighborhoods&callback=?&format=json&srid=4326&fields=id&parameters=&x=' + lon + '&y=' + lat;
    $.getJSON(url, function(data) {
        if (data.total_rows > 0) {
            changeNeighborhood(data.rows[0].row.id);
            addMarker(lat, lon);
        }
    });
}

/*
    Get NPA feature
*/
function getNPALayer(idvalue) {
    var layer;
    $.each(geojson._layers, function() {
        if (this.feature.properties.id == idvalue) layer = this;
    });
    return layer;
}

/*
    Find locations
*/
function locationFinder(data) {
    performIntersection(data.lat, data.lng);
}

/*
    Map NPA geojson decoration functions
*/
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: selectFeature
    });
}
function style(feature) {
    return {
        fillColor: getColor(feature.properties[activeMeasure]),
        weight: 1,
        opacity: 1,
        color: '#ffffff',
        fillOpacity: $("#opacity_slider").slider("value") / 100
    };
}
function getColor(d) {
    var color = "";
    var colors = FTmeta[activeMeasure].style.colors;
    var breaks = FTmeta[activeMeasure].style.breaks;
    $.each(breaks, function(index, value) {
        if (value <= d && d !== null) {
            color = colors[index];
            return;
        }
    });
    if (color.length > 0) { return color; }
    else return "#666666";
}
function highlightFeature(e) {
    var layer = e.target;
    if (!activeRecord || (activeRecord && activeRecord.id != e.target.feature.properties.id)) layer.setStyle({
        weight: 3,
        color: '#ffcc00'
    });
    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}
function resetHighlight(e) {
    var layer = e.target;
     if (!activeRecord || (activeRecord && activeRecord.id != layer.feature.properties.id)) layer.setStyle({
        weight: 1,
        color: '#f5f5f5'
    });
    info.update();
}
function highlightSelected(layer) {
    geojson.setStyle(style);
    layer.setStyle({
        weight: 7,
        color: '#0283D5',
        dashArray: ''
    });
    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
}
function selectFeature(e) {
    var layer = e.target;
    changeNeighborhood(layer.feature.properties.id);
}
