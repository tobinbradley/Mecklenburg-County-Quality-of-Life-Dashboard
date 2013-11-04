function drawMap(msg, data) {

    var mapsize = {
        "width": $("#map-container").parent().width(),
        "height": $("#map-container").parent().height(),
        "margin": "20px"
    };

    var projection = d3.geo.mercator()
        .center([-80.827, 35.260])
        .scale(52000)
        .translate([mapsize.width / 2, mapsize.height / 2]);

    var path = d3.geo.path()
        .projection(projection);

    npaMap = d3.select(".map")
        .attr("viewBox", "0 0 " + mapsize.width + " " + mapsize.height);


    if (msg === 'initializeMap') {
        npaMap.select(".neighborhoods")
            .selectAll("path")
            .data(topojson.feature(data.neighborhoods, data.neighborhoods.objects.npa2).features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", "none")
            .attr("data-npa", function(d) {
                return d.id;
            });
    }


    var data = metricData[year];
    d3.selectAll(".neighborhoods path").each(function () {
        var item = d3.select(this);
        item.attr('class', quantize(data.get(item.attr('data-npa'))) + "-9 map-tooltips")
            .attr("data-value", data.get(item.attr('data-npa')))
            .attr("data-quantile", quantize(data.get(item.attr('data-npa'))))
            .attr("data-toggle", "tooltip")
            .attr("data-original-title", function(d) {
                return "Neighborhood " + item.attr('data-npa') + "<br>" + data.get(item.attr('data-npa'));
            });
    });

    var xScale = d3.scale.linear()
        .domain(x_extent)
        .range([0, $("#barChart").parent().width() - 40]);

    npaMap.selectAll(".neighborhoods path")
        //.datum(topojson.feature(data.neighborhoods, data.neighborhoods.objects.npa2))
        .on("mouseover", function(d) {
            var sel = d3.select(this);
            sel.moveToFront();
            d3Highlight(".barchart", sel.attr("data-quantile"), true);
            sel.classed("d3-highlight", true);

            d3.select(".mean-map-hover")
                .attr("cx", xScale(sel.attr("data-value")))
                //.attr("cx", 100)
                .attr("r", 5);
        })
        .on("mouseout", function(d) {
            var sel = d3.select(this);
            d3Highlight(".barchart", sel.attr("data-quantile"), false);
            sel.classed("d3-highlight", false);

            d3.select(".mean-map-hover")
                .attr("r", 0);
        });

    // tooltips
    $('.map-tooltips').tooltip({container:'body', delay: { show: 300, hide: 100 }, html: true});


}
