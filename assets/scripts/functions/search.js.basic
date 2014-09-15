// ****************************************
// Initialize twitter typeahead
// Advanced version of this in search.js.advanced
// ****************************************
function initTypeahead() {
    var polyid = _.map(model.geom.objects[neighborhoods].geometries, function(d){ return d.id.toString(); });
    $("#searchbox").click(function () { $(this).select(); }).focus();
    $('.typeahead').typeahead([
        {
            name: neighborhoodDescriptor,
            local: polyid,
            header: '<h4 class="typeahead-header"><span class="glyphicon glyphicon-home"></span> ' + neighborhoodDescriptor + '</h4>'
        }
    ]).on('typeahead:selected', function (obj, datum) {
        // select neighborhood
        geocode({"id": datum.value});
        model.selected = _.union(model.selected, [datum.value]);
    });
}
