function drawBarChart(msg) {

    var data = quantizeCount(metricData[year].map.values());
    var countyMean = Math.round(d3.mean(metricData[year].map.values()) * 10) / 10;
    var qtiles = quantize.quantiles();
    var theMetric = $("#metric").val();

    var margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
    },
        width = $("#barChart").parent().width() - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    var qtilesLabel = [];
    _.each(qtiles, function(d, i) {
        qtilesLabel[i] = parseFloat(d).toFixed(1).commafy();
    });

    // x/y/scale stuff
    var x = d3.scale.linear()
        .domain([0, data.length])
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0])
        .domain([0, d3.max(data, function(d) {
            if (d.value > 250) {
                return d.value;
            } else {
                return 250;
            }
        })]);
    var xScale = d3.scale.linear()
        .domain(x_extent)
        .range([0, width]);



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
        return "<span>" + d.range + "</span><br><span>" + d.num + "</span> NPA(s)";
      });



    // set up bar chart
    barChart = d3.select(".barchart");
    barChart.call(tip);
    barChart.select("g.barchart-container")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    barChart.select(".x.axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // create bars and mean indicator on initialization
    if (msg === 'initialize') {
        // create original rects
        var barContainer = barChart.select(".bar-container");
        barContainer.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", function(d) {
                return "bar chart-tooltips " + d.key;
            })
            .attr("data-quantile", function(d) {
                return d.key;
            });

        // create county mean indicator
        barChart.select(".means")
            .append("line")
            .attr("class", "mean-indicator mean-county mean-line")
            .attr("y1", y(0))
            .attr("y2", 100);
        barChart.select(".means")
            .append("text")
            .attr("class", "mean-indicator mean-county mean-text")
            .attr("text-anchor", "middle")
            .attr("y", 95);
        barChart.select(".means")
            .append("text")
                  .attr("class", "mean-label")
                  .attr("transform", "rotate(-90)")
                  .attr("x", -155)
                  //.attr("dy", ".71em")
                  .style("text-anchor", "end")
                  .text("mean");

    }

    // set bar position, height, and tooltip info
    barChart.selectAll("rect")
        .data(data)
        .transition()
        .duration(1000)
        .attr("width", width / data.length)
        .attr("x", function(d,i) {
            return x(i);
        })
        .attr("y", function(d) {
            return y(d.value + 6);
        })
        .attr("height", function(d) {
            return height - y(d.value) + 5;
        })
        .attr("data-original-title", function(d, i) {
            if (i === 0) {
                return d3.min(x_extent).toFixed(1).commafy() + " - " + qtilesLabel[i];
            }
            if (i === colorbreaks - 1) {
                return qtilesLabel[i - 1] + " - " + d3.max(x_extent).toFixed(1).commafy();
            } else {
                return qtilesLabel[i - 1] + " - " + qtilesLabel[i];
            }
        });

    // county mean indicator
    barChart.select(".mean-line.mean-county")
        .transition()
        .attr("x1", xScale(countyMean))
        .attr("x2", xScale(countyMean));
    barChart.select(".mean-text.mean-county")
        .transition()
        .attr("x", xScale(countyMean))
        .text(dataPretty(theMetric, countyMean) );
    barChart.select(".mean-label")
        .transition()
        .attr("y", xScale(countyMean) - 4);




    // bar hover actions
    barChart.selectAll("rect")
        .on("mouseover", function(d) {
            var sel = d3.select(this);
            d3Highlight(".geom", sel.attr("data-quantile"), true);
            sel.classed("d3-highlight", true);
            tip.attr('class', 'd3-tip animate').show({"range": sel.attr("data-original-title"), "num": d.value});
        })
        .on("mouseout", function(d) {
            var sel = d3.select(this);
            d3Highlight(".geom", sel.attr("data-quantile"), false);
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


    // store chart with for responsiveness
    barchartWidth = $(".barchart").width();

}
