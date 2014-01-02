function drawMap(msg, data) {

    // add leaflet layer on init
    if (msg === 'initializeMap') {
        L.d3(data.neighborhoods,{
            topojson:"npa2",
            svgClass : "neighborhoods"
        }).addTo(map);
    }

    var theMetric = $("#metric").val();

    var data = metricData[year].map;
    d3.selectAll(".neighborhoods path").each(function () {
        var item = d3.select(this);
        item.attr('class', function (d) {
                return quantize(data.get(item.attr('data-npa'))) + "-9 map-tooltips";
            })
            .attr("data-value", data.get(item.attr('data-npa')))
            .attr("data-quantile", quantize(data.get(item.attr('data-npa'))))
            .attr("data-toggle", "tooltip")
            .attr("data-original-title", function(d) {
                return "Neighborhood " + item.attr('data-npa') + "<br>" + dataPretty(theMetric, data.get(item.attr('data-npa')));
            });
    });

    var xScale = d3.scale.linear()
        .domain(x_extent)
        .range([0, $("#barChart").parent().width() - 40]);

     var y = d3.scale.linear()
        .range([250, 0]);

    y.domain([0, 250]);

    d3.selectAll(".neighborhoods path")
        .on("mouseover", function() {
            var sel = d3.select(this);
            if (!sel.classed("undefined-9")) {
                // hack for movetofront because IE hates this
                if (navigator.appName !== 'Microsoft Internet Explorer') { sel.moveToFront(); }

                d3Highlight(".barchart", sel.attr("data-quantile"), true);
                sel.classed("d3-highlight", true);

                var xVal = xScale(sel.attr("data-value"));

                // create county mean indicator
                barChart.select(".means")
                    .append("line")
                    .attr("class", "mean-indicator mean-line mean-hover")
                    .attr("x1", xVal)
                    .attr("x2", xVal)
                    .attr("y1", y(0))
                    .attr("y2", y(40));
                barChart.select(".means")
                   .append("path")
                   .attr("transform", "translate(" + xVal + "," + y(5) + ")")
                   .attr("d", d3.svg.symbol().type("triangle-down").size(60))
                   .attr("class", "mean-indicator mean-triangle mean-hover");
                barChart.select(".means")
                    .append("text")
                    .attr("class", "mean-indicator mean-text mean-hover")
                    .attr("x", xVal)
                    .attr("y", y(40))
                    .text(dataPretty(theMetric, sel.attr("data-value")));
            }
        })
        .on("mouseout", function() {

            var sel = d3.select(this);

            d3Highlight(".barchart", sel.attr("data-quantile"), false);
            sel.classed("d3-highlight", false);

            d3.selectAll(".mean-hover").remove();

        });

    // tooltips
    $('.map-tooltips').tooltip({container:'#map', delay: { show: 300, hide: 100 }, html: true});

}

