// set up typeahead.js
// This is a basic setup that does only the selected neighborhood.

function initTypeahead() {
    var polyid = _.map(model.geom.objects[neighborhoods].geometries, function(d){ return d.id.toString(); });

    $("#searchbox").click(function () { $(this).select(); }).focus();

    $('.typeahead').typeahead([
        {
            name: 'npa',
            local: polyid,
            header: '<h4 class="typeahead-header"><span class="glyphicon glyphicon-home"></span> NPA</h4>'
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
                    var sel = d3.select(".geom[data-id='" + data[0].id + "']");
                    geocode({"id": data[0].id, "lat": datum.lat, "lng": datum.lng});
                    d3Select(data[0].id);
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
                            var sel = d3.select(".geom[data-id='" + d.id + "']");
                            arr.push(d.id);
                            d3Select(d.id);
                        });
                        d3ZoomPolys("", {"ids": arr});
                    }
                });
            }
            else {
                // select neighborhood
                geocode({"id": parseInt(datum.value)});
                d3Select(parseInt(datum.value));
            }
        }
    });

}
