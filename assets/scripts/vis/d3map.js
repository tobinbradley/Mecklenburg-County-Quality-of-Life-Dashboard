function drawMap(msg, data) {

    // add leaflet layer on init
    if (msg === 'initialize') {
        L.d3(data.geom,{
            topojson: "npa2",
            svgClass: "geom"
        }).addTo(map);
    }

    var theMetric = $("#metric").val();

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return "<strong><span>NPA " + d.geomid + "</span><br>" + d.num + "</span>";
      });

    var theGeom = d3.selectAll(".geom path");
    theGeom.call(tip);


    // clear out quantile classes
    var classlist = [];
    for (i = 0; i < colorbreaks; i++) {
        classlist.push("q" + i);
    }
    theGeom.classed(classlist.join(" "), false);

    var theData = metricData[year].map;
    theGeom.each(function () {
        var item = d3.select(this);
        var styleClass = quantize(theData.get(item.attr('data-id')));
        if (!styleClass) { styleClass = ""; }
        item.classed(styleClass, true)
            .attr("data-value", theData.get(item.attr('data-id')))
            .attr("data-quantile", quantize(theData.get(item.attr('data-id'))))
            .attr("data-toggle", "tooltip")
            .attr("data-original-title", function(d) {
                return "Neighborhood " + item.attr('data-id') + "<br>" + dataPretty(theMetric, theData.get(item.attr('data-id')));
            });
    });

    var xScale = d3.scale.linear().domain(x_extent).range([0, $("#barChart").parent().width() - 40]);

     var y = d3.scale.linear().range([260, 0]).domain([0, 260]);

    theGeom
        .on("mouseover", function() {
            var sel = d3.select(this);
            tip.show(sel.attr("data-original-title"));
            if (sel.attr("data-value") !== "undefined") {
                // hack for movetofront because IE hates this
                if (navigator.appName !== 'Microsoft Internet Explorer') { sel.moveToFront(); }

                d3Highlight(".barchart", sel.attr("data-quantile"), true);
                sel.classed("d3-highlight", true);

                tip.attr('class', 'd3-tip animate').show({"geomid": sel.attr("data-id"), "num": sel.attr("data-value")});

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
            tip.attr('class', 'd3-tip').show({"geomid": sel.attr("data-id"), "num": sel.attr("data-value") });
            tip.hide();
        })
        .on("mousedown", function() {
            mapcenter = map.getCenter();
        })
        .on("click", function(d) {
                var sel = d3.select(this);
                PubSub.publish('selectGeo', {
                    "id": sel.attr("data-id"),
                    "value": sel.attr("data-value"),
                    "d3obj": sel
                });
            //}
        });

}

