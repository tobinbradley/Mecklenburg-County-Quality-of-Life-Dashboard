function barChart() {
    var width = 720, // default width
        height = 280, // default height
        margins = [20, 20, 20, 40],
        x,
        y,
        xScale;

    function my() {
        var data = quantizeCount(metricData[year].map.values());
        var countyMean = Math.round(d3.mean(metricData[year].map.values()) * 10) / 10;
        var qtiles = quantize.quantiles();
        var theMetric = $("#metric").val();

        var w = width - margins[1] - margins[3];
        var h = height - margins[0] - margins[2];

        var container = $("#barChart");

        // x/y/scale stuff
        my.x(w, data.length);
        my.y(h, _.max(data, function(d){ return d.value; }).value) ;
        my.xScale(w, x_extent);

        // axis labeling
        var xAxis = d3.svg.axis()
            .scale(xScale)
            .tickFormat(function(d) { return d; })
            .orient("bottom")
            .ticks(5);

        var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(d) {
            var theRange = _.map(d.range.split("-"), function(num){ return parseFloat(parseFloat(num).toFixed(1)).toString().commafy(); });
            return "<span>" + theRange.join(" to ") + "</span><br><span>" + d.num + "</span> NPA(s)";
          });

        // set up bar chart
        graph = d3.select(".barchart");
        graph.call(tip);
        graph.select("g.barchart-container")
            .attr("transform", "translate(" + margins[3] + "," + margins[0] + ")");
        graph.select(".x.axis")
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis);

        // create original rects
            var barContainer = graph.select(".bar-container");
            barContainer.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", function(d) {
                    return "bar chart-tooltips " + d.key;
                })
                .attr("data-quantile", function(d) {
                    return d.key;
                });

        // // set bar position, height, and tooltip info
        graph.selectAll("rect")
            .data(data)
            .transition()
            .duration(1000)
            .attr("width", w / data.length)
            .attr("x", function(d,i) {
                return x(i);
            })
            .attr("y", function(d) {
                return y(d.value);
            })
            .attr("height", function(d) {
                return h - y(d.value) + 6;
            })
            .attr("data-original-title", function(d, i) {
                if (i === 0) {
                    return d3.min(x_extent) + " - " + qtiles[i];
                }
                if (i === colorbreaks - 1) {
                    return qtiles[i - 1] + " - " + d3.max(x_extent);
                } else {
                    return qtiles[i - 1] + " - " + qtiles[i];
                }
            });

        // // county mean indicator
        graph.select(".value-mean line")
            .transition()
            .attr("y1", y(0))
            .attr("y2", 100)
            .attr("x1", xScale(countyMean))
            .attr("x2", xScale(countyMean));
        graph.select(".value-mean .mean-text")
            .transition()
            .attr("x", xScale(countyMean))
            .attr("y", 95)
            .text(dataPretty(theMetric, countyMean) );
        graph.select(".value-mean .mean-label")
            .transition()
            .attr("y", xScale(countyMean) - 4);

        // bar hover actions
        graph.selectAll("rect")
            .on("mouseover", function(d) {
                var sel = d3.select(this);
                d3.selectAll(".geom path[data-quantile='" + sel.attr("data-quantile") + "']").classed("d3-highlight", true);
                sel.classed("d3-highlight", true);
                tip.attr('class', 'd3-tip animate').show({"range": sel.attr("data-original-title"), "num": d.value});
            })
            .on("mouseout", function(d) {
                var sel = d3.select(this);
                d3.selectAll(".geom path[data-quantile='" + sel.attr("data-quantile") + "']").classed("d3-highlight", false);
                sel.classed("d3-highlight", false);
                tip.attr('class', 'd3-tip').show({"range": sel.attr("data-original-title"), "num": d.value});
                tip.hide();
            })
            .on("click", function(d) {
                var sel = d3.select(this);
                d3.selectAll(".geom path[data-quantile='" + sel.attr("data-quantile") + "'").each(function () {
                    //var mrk = d3.select(this);
                    // if marker doesn't exist
                    var sel = d3.select(this);
                    PubSub.publish('selectGeo', {
                        "id": sel.attr("data-id"),
                        "value": sel.attr("data-value"),
                        "d3obj": sel
                    });
                });
            });

        my.pointerMove();

        // // store chart with for responsiveness
        barchartWidth = $(".barchart").width();
    }

    my.container = function(value) {
      var el = document.getElementById(value);
      width = el.offsetWidth;
      height = el.offsetHeight;
      return my;
    };

    my.x = function(width, max) {
      if (!arguments.length) { return x; }
      x = d3.scale.linear().domain([0, max]).range([0, width]);
      return my;
    };

    my.y = function(height, max) {
      if (!arguments.length) { return y; }
      y = d3.scale.linear().range([height, 0]).domain([0, max]);
      return my;
    };

    my.xScale = function(width, extent) {
        if (!arguments.length) { return xScale; }
        xScale = d3.scale.linear().domain(extent).range([0, width]);
        return my;
    };

    my.pointerAdd = function (id, value, container) {
        d3.select(container)
            .append("line")
            .attr("x1", xScale(value))
            .attr("x2", xScale(value))
            .attr("y1", y(0))
            .attr("y2", y(40))
            .attr("data-id", id);
        d3.select(container)
           .append("path")
           .attr("transform", "translate(" + xScale(value) + "," + 255 + ")")
           .attr("d", d3.svg.symbol().type("triangle-down").size(75))
           .attr("data-id", id);
        d3.select(container)
            .append("text")
            .attr("x", xScale(value))
            .attr("y", y(40))
            .text(dataPretty($("#metric").val(), value))
            .attr("data-id", id);
        return my;
    };

    my.pointerRemove = function (id, container) {
        d3.selectAll(".barchart " + container + " [data-id='" + id + "']").remove();
        return my;
    };

    my.pointerMove = function() {
        d3.selectAll(".geom path.d3-select")
            .each(function(d) {
                var item = d3.select(this);
                if ($.isNumeric(item.attr("data-value"))) {
                    d3.select(".value-select path[data-id='" + item.attr("data-id") + "']")
                        .transition()
                        .duration(1000)
                        .attr("opacity", "1")
                        .attr("transform", "translate(" + xScale(metricData[year].map.get(item.attr("data-id"))) + "," + 255 + ")");
                }
                else {
                    d3.select(".value-select path[data-id='" + item.attr("data-id") + "']")
                        .attr("opacity", "0");
                }
            });

        return my;
    };

    return my;
}

function drawBarChart() {
    valueChart.container("barChart");
    valueChart();
}




