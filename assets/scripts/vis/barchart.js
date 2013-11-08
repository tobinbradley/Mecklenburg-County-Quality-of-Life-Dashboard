function drawBarChart(msg) {

    var data = quantizeCount(metricData[year].values());
    var countyMean = Math.round(d3.mean(metricData[year].values()));

    var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 20
    },
        width = $("#barChart").parent().width() - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;


    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width]);

    //Create scale functions
    var xScale = d3.scale.linear()
        .domain(x_extent)
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .tickFormat(function(d) {
            return d;
        })
        .ticks(5);


    x.domain(data.map(function(d, i) {
        return d.key;
    }));
    y.domain([0, d3.max(data, function(d) {
        if (d.value > 250) {
            return d.value;
        } else {
            return 250;
        }
    })]);


    barChart = d3.select(".barchart");

    // add translate to needed features
    barChart.select("g.barchart-container")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    barChart.select(".x.axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);


    if (msg === 'initializeBarChart') {
        // create original rects
        var barContainer = barChart.select(".bar-container");
        barContainer.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", function(d) {
                return "bar chart-tooltips " + d.key + "-9";
            })
            .attr("x", function(d) {
                return x(d.key);
            })
            .attr("width", x.rangeBand())
            .attr("data-toggle", "tooltip")
            .attr("data-quantile", function(d) {
                return d.key;
            });

        // create county mean indicator
        barChart.select(".means")
           .append("path")
           .attr("transform", "translate(" + xScale(countyMean) + "," + y(6) + ")")
           .attr("d", d3.svg.symbol().type("triangle-down").size(60))
           .attr("class", "mean-indicator mean-triangle mean-county");
         barChart.select(".means")
            .append("line")
            .attr("class", "mean-indicator mean-line mean-county")
            .attr("x1", xScale(countyMean))
            .attr("x2", xScale(countyMean))
            .attr("y1", y(0))
            .attr("y2", y(40));
        barChart.select(".means")
            .append("text")
            .attr("class", "mean-indicator mean-text mean-county")
            .attr("x", xScale(countyMean))
            .attr("y", y(40))
            .text(countyMean);
    }

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


    barChart.select(".mean-map-hover")
        .attr("cy", y(7))
        .attr('r', 0);

    $('.chart-tooltips').tooltip({
        container: 'body',
        delay: {
            show: 100,
            hide: 100
        },
        html: true
    });

    var qtiles = quantize.quantiles();

    barChart.selectAll("rect")
        .data(data)
        .transition()
        .duration(1000)
        .attr("width", x.rangeBand())
        .attr("x", function(d) {
            return x(d.key);
        })
        .attr("y", function(d) {
            return y(d.value + 5);
        })
        .attr("height", function(d) {
            return height - y(d.value) + 5;
        })
        .attr("data-original-title", function(d, i) {
            if (i === 0) {
                return Math.round(d3.min(x_extent)) + " - " + Math.round(qtiles[i]);
            }
            if (i === 8) {
                return Math.round(qtiles[i - 1]) + " - " + Math.round(d3.max(x_extent));
            } else {
                return Math.round(qtiles[i - 1]) + " - " + Math.round(qtiles[i]);
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
        .text( Math.round(countyMean) );


    barchartWidth = $(".barchart").width();

}
