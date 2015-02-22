// set up typeahead.js
// This is Mecklenburg's, which has a lot of calls to our spiffy web services that
// will not help you at all other than as an example of what you could do.
//
// Most of our calls are going to our REST-ish HTTP API which you can find on
// github at https://github.com/tobinbradley/dirt-simple-postgis-http-api

// ****************************************
// Initizilze twitter typeahead
// ****************************************
function initTypeahead() {
    var polyid = _.map(model.geom.objects[neighborhoods].geometries, function(d){ return d.id.toString(); });

    $("#searchbox").click(function () { $(this).select(); }).focus();

    $('.typeahead').typeahead([
        {
            name: 'npa',
            local: polyid,
            header: '<h4 class="typeahead-header"><span class="glyphicon glyphicon-home"></span> NPA</h4>'
        },
        {
            name: 'Address',
            remote: {
                url: 'http://maps.co.mecklenburg.nc.us/rest/v4/ws_geo_ubersearch.php?searchtypes=address&query=%QUERY',
                dataType: 'jsonp',
                filter: function (data) {
                    var dataset = [];
                    _.each(data, function (item) {
                        dataset.push({
                            value: item.name,
                            label: item.name,
                            gid: item.gid,
                            pid: item.moreinfo,
                            layer: 'Address',
                            lat: item.lat,
                            lng: item.lng
                        });
                    });
                    var query = $(".typeahead").val();
                    if (dataset.length === 0 && $.isNumeric(query.split(" ")[0]) && query.trim().split(" ").length > 1) {
                        dataset.push({ value: "No records found." });
                    }
                    return dataset;
                }
            },
            minLength: 4,
            limit: 10,
            header: '<h4 class="typeahead-header"><span class="glyphicon glyphicon-map-marker"></span> Address</h4>'
        },
        {
            name: 'NSA',
            remote: {
                url: 'http://maps.co.mecklenburg.nc.us/rest/v4/ws_geo_ubersearch.php?searchtypes=nsa&query=%QUERY',
                dataType: 'jsonp',
                filter: function (data) {
                    var dataset = [];
                    _.each(data, function (item) {
                        dataset.push({
                            value: item.name,
                            gid: item.gid,
                            pid: item.name,
                            layer: 'NSA'
                        });
                    });
                    var query = $(".typeahead").val();
                    if (dataset.length === 0 && query.length === 8 && query.indexOf(" ") === -1 && $.isNumeric(query.substring(0, 5))) {
                        dataset.push({ value: "No records found." }); }
                    return dataset;
                }
            },
            minLength: 4,
            limit: 5,
            header: '<h4 class="typeahead-header"><span class="glyphicon glyphicon-home"></span> NSA Neighborhood</h4>'
        }, {
            name: 'PID',
            remote: {
                url: 'http://maps.co.mecklenburg.nc.us/rest/v4/ws_geo_ubersearch.php?searchtypes=pid&query=%QUERY',
                dataType: 'jsonp',
                filter: function (data) {
                    var dataset = [];
                    _.each(data, function (item) {
                        dataset.push({
                            value: item.name,
                            label: item.moreinfo,
                            gid: item.gid,
                            pid: item.name,
                            layer: 'PID',
                            lat: item.lat,
                            lng: item.lng
                        });
                    });
                    var query = $(".typeahead").val();
                    if (dataset.length === 0 && query.length === 8 && query.indexOf(" ") === -1 && $.isNumeric(query.substring(0, 5))) {
                        dataset.push({ value: "No records found." }); }
                    return dataset;
                }
            },
            minLength: 8,
            limit: 5,
            header: '<h4 class="typeahead-header"><span class="glyphicon glyphicon-home"></span> Parcel</h4>'
        }, {
            name: 'POI',
            remote: {
                url: 'http://maps.co.mecklenburg.nc.us/rest/v4/ws_geo_ubersearch.php?searchtypes=park,library,school&query=%QUERY',
                dataType: 'jsonp',
                filter: function (data) {
                    var dataset = [];
                    _.each(data, function (item) {
                        dataset.push({
                            value: item.name,
                            label: item.name,
                            layer: 'Point of Interest',
                            lat: item.lat,
                            lng: item.lng
                        });
                    });
                    if (dataset.length === 0) { dataset.push({ value: "No records found." }); }
                    return _.sortBy(dataset, "value");
                }
            },
            minLength: 4,
            limit: 15,
            header: '<h4 class="typeahead-header"><span class="glyphicon glyphicon-star"></span> Point of Interest</h4>'
        }, {
            name: 'business',
            remote: {
                url: 'http://maps.co.mecklenburg.nc.us/rest/v4/ws_geo_ubersearch.php?searchtypes=business&query=%QUERY',
                dataType: 'jsonp',
                filter: function (data) {
                    var dataset = [];
                    _.each(data, function (item) {
                        dataset.push({
                            value: item.name,
                            label: item.name,
                            layer: 'Point of Interest',
                            lat: item.lat,
                            lng: item.lng
                        });
                    });
                    if (dataset.length === 0) { dataset.push({ value: "No records found." }); }
                    return _.sortBy(dataset, "value");
                }
            },
            minLength: 4,
            limit: 15,
            header: '<h4 class="typeahead-header"><span class="glyphicon glyphicon-briefcase"></span> Business</h4>'
        }
    ]).on('typeahead:selected', function (obj, datum) {
        if (datum.lat) {
            $.ajax({
                url: 'http://maps.co.mecklenburg.nc.us/rest/v2/ws_geo_pointoverlay.php',
                type: 'GET',
                dataType: 'jsonp',
                data: {
                    'x': datum.lng,
                    'y': datum.lat,
                    'srid': 4326,
                    'table': 'neighborhoods',
                    'fields': 'id'
                },
                success: function (data) {
                    geocode({"id": data[0].id.toString(), "lat": datum.lat, "lng": datum.lng});
                    model.selected = _.union(model.selected, [data[0].id.toString()]);
                }
            });
        }
        else {
            if (datum.layer === 'NSA') {
                // ajax call to get NPA's that intersect selected NSA
                $.ajax({
                    type: "GET",
                    dataType: 'jsonp',
                    url: "http://maps.co.mecklenburg.nc.us/rest/v3/ws_geo_attributequery.php",
                    data: {
                        table: "neighborhoods npa, neighborhood_statistical_areas nsa",
                        fields: "npa.id",
                        parameters: "nsa.gid = " + datum.gid + " and ST_Intersects(ST_Buffer(nsa.the_geom, -50), npa.the_geom)"
                    },
                    success: function(data) {
                        var arr = [];
                        _.each(data, function(d) {
                            arr.push(d.id.toString());
                        });
                        model.selected = _.union(model.selected, arr);
                        d3ZoomPolys("", {"ids": arr});
                    }
                });
            }
            else {
                // select neighborhood
                geocode({"id": datum.value});
                model.selected = _.union(model.selected, [datum.value]);
            }
        }
    });

}
