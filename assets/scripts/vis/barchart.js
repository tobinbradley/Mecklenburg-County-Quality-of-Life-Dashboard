function drawBarChart(msg) {

    var data = quantizeCount(metricData[year].map.values());
    var countyMean = Math.round(d3.mean(metricData[year].map.values()) * 10) / 10;
    var qtiles = quantize.quantiles();
    var theMetric = $("#metric").val();

    var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 20
    },
        width = $("#barChart").parent().width() - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

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


    // set up bar chart
    barChart = d3.select(".barchart");
    barChart.select("g.barchart-container")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    barChart.select(".x.axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // create bars and mean indicator on initialization
    if (msg === 'initializeBarChart') {
        // create original rects
        var barContainer = barChart.select(".bar-container");
        barContainer.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", function(d) {
                return "bar chart-tooltips " + d.key + "-9";
            })
            .attr("data-toggle", "tooltip")
            .attr("data-quantile", function(d) {
                return d.key;
            });

        // create county mean indicator

        barChart.select(".means")
            .append("line")
            .attr("class", "mean-indicator mean-county mean-line")
            .attr("x1", xScale(countyMean))
            .attr("x2", xScale(countyMean))
            .attr("y1", y(0))
            .attr("y2", y(20));
        barChart.select(".means")
           .append("path")
           .attr("transform", "translate(" + xScale(countyMean) + "," + y(5) + ")")
           .attr("d", d3.svg.symbol().type("triangle-down").size(60))
           .attr("class", "mean-indicator mean-county mean-triangle");
        barChart.select(".means")
            .append("text")
            .attr("class", "mean-indicator mean-county mean-text")
            .attr("x", xScale(countyMean))
            .attr("y", y(20))
            .text(countyMean);
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
            return y(d.value + 5);
        })
        .attr("height", function(d) {
            return height - y(d.value) + 5;
        })
        .attr("data-original-title", function(d, i) {
            if (i === 0) {
                return d3.min(x_extent).toFixed(1) + " - " + qtiles[i].toFixed(1);
            }
            if (i === 8) {
                return qtiles[i - 1].toFixed(1) + " - " + d3.max(x_extent).toFixed(1);
            } else {
                return qtiles[i - 1].toFixed(1) + " - " + qtiles[i].toFixed(1);
            }
        });

    // county mean indicator
     barChart.select(".mean-triangle.mean-county")
        .transition()
        .attr("transform", "translate(" + xScale(countyMean) + "," + y(6) + ")");
    barChart.select(".mean-line.mean-county")
        .transition()
        .attr("x1", xScale(countyMean))
        .attr("x2", xScale(countyMean));
    barChart.select(".mean-text.mean-county")
        .transition()
        .attr("x", xScale(countyMean))
        .text( dataPretty(theMetric, countyMean) );


    // bar hover actions
    barChart.selectAll("rect")
        .on("mouseover", function(d) {
            var sel = d3.select(this);
            d3Highlight(".neighborhoods", sel.attr("data-quantile"), true);
            sel.classed("d3-highlight", true);
        })
        .on("mouseout", function(d) {
            var sel = d3.select(this);
            d3Highlight(".neighborhoods", sel.attr("data-quantile"), false);
            sel.classed("d3-highlight", false);
        });


    // bootstrap tooptips
    $('.chart-tooltips').tooltip({
        container: 'body',
        delay: {
            show: 100,
            hide: 100
        },
        html: true
    });

    // store chart with for responsiveness
    barchartWidth = $(".barchart").width();

}
