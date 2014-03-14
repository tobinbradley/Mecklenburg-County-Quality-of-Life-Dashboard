function drawMap(msg, data) {

    if (msg === 'initialize') {

      // Eyes wide open for this narly hack.
      // There are lots of different ways to put a D3 layer on Leaflet, and I found
      // them all to be annoying and/or weird. So, here I'm adding the topojson as a
      // regular leaflet layer so Leaflet can manage zooming/redrawing/events/etc. However,
      // I want D3 to manage symbolization et al, so I rely on the fact that Leaflet
      // adds the polys in the topojson order to add a data-id and geom class to the
      // layer so I can handle it D3-ish rather than through the Leaflet API.

      d3Layer = L.geoJson(topojson.feature(data.geom, data.geom.objects.npa),
        {
            style:  {
                "fillColor": "none",
                "color": "none",
                "fillOpacity": 1
            }
        }).addTo(map);

      d3Layer.on("click", function(d) {
        var sel = d3.select(".geom [data-id='" + d.layer.feature.id + "']");
        PubSub.publish('selectGeo', {
            "id": sel.attr("data-id"),
            "value": sel.attr("data-value"),
            "d3obj": sel
        });
      });

      d3.select(".leaflet-overlay-pane svg").classed("geom", true).selectAll(".geom path").attr("data-id",  function(d, i) { return data.geom.objects.npa.geometries[i].id; });

  }

    var theMetric = $("#metric").val();

    var maptip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<strong><span>NPA " + d.geomid + "</span><br>" + dataPretty(d.num) + "</span>";
        });

    var theGeom = d3.selectAll(".geom path");
    theGeom.call(maptip);


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
                return "Neighborhood " + item.attr('data-id') + "<br>" + dataPretty(theData.get(item.attr('data-id')));
            });
    });

    var xScale = d3.scale.linear().domain(x_extent).range([0, $("#barChart").parent().width() - 60]);

     var y = d3.scale.linear().range([260, 0]).domain([0, 260]);

    d3.selectAll(".geom path").on("mouseover", null);
    theGeom
        .on("mouseover", function() {
            var sel = d3.select(this);
            if ($.isNumeric(sel.attr("data-value"))) {

                maptip.show(sel.attr("data-original-title"));
                // hack for movetofront because IE hates this
                if (navigator.userAgent.match(/Trident/) === null) { sel.moveToFront(); }

                // chart highlight
                trendChart.lineAdd(".trend-highlight", sel.attr("data-id"));
                valueChart.pointerAdd(sel.attr("data-id"), sel.attr("data-value"), ".value-hover");

                //d3Highlight(".barchart", sel.attr("data-quantile"), true);
                sel.classed("d3-highlight", true);

                maptip.attr('class', 'd3-tip animate').show({"geomid": sel.attr("data-id"), "num": sel.attr("data-value")});

            }
        })
        .on("mouseout", function() {
            var sel = d3.select(this);
            //d3Highlight(".barchart", sel.attr("data-quantile"), false);
            sel.classed("d3-highlight", false);

            maptip.attr('class', 'd3-tip').show({"geomid": sel.attr("data-id"), "num": sel.attr("data-value") });
            maptip.hide();

            // remove chart highlights
            valueChart.pointerRemove(sel.attr("data-id"), ".value-hover");
            trendChart.linesRemove(".trend-highlight");
        });

}

