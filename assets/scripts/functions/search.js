// set up typeahead.js
// This is a basic setup that does only the selected neighborhood.

function initTypeahead(msg, data) {
    var polyid = _.map(data.geom.objects[neighborhoods].geometries, function(d){ return d.id.toString(); });
    $("#searchbox").click(function () { $(this).select(); }).focus();
    $('.typeahead').typeahead([
        {
            name: 'npa',
            local: polyid,
            header: '<h4 class="typeahead-header"><span class="glyphicon glyphicon-home"></span> NPA</h4>'
        }
    ]).on('typeahead:selected', function (obj, datum) {
        // select neighborhood
        var sel = d3.select(".geom[data-id='" + datum.value + "']");
        PubSub.publish('findNeighborhood', {
            "d3obj": sel,
            "id": parseInt(datum.value)
        });

    });

    // placeholder for $#!@#$! IE
    if ($.support.placeholder) {
        $('input, textarea').placeholder();
        $('input').focus().blur();
    }
}
