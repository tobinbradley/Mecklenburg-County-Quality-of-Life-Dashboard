function drawBarChart(msg) {

    var data = quantizeCount(metricData[year].values());

    var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 10
    },
        width = $("#barChart").parent().width() - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;


    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], 0.1);

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
        }
        else {
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
    }

    // set barChart viewport
    barChart.attr("viewBox", "0 0 " + $(".barchart").width() + " " + $(".barchart").height());


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

    var countyMean = Math.round(d3.mean(metricData[year].values()));
    barChart.select(".mean-county")
        .attr("cx", xScale(countyMean))
        .attr("cy", y(7))
        .attr('r', 6)
        .attr("data-toggle", "tooltip")
        .attr("data-original-title", "County Average: " + countyMean);

    barChart.select(".mean-map-hover")
        .attr("cy", y(7))
        .attr('r', 0);

    $('.chart-tooltips').tooltip({container:'body', delay: { show: 100, hide: 100 }, html: true});

    var qtiles = quantize.quantiles();

    barChart.selectAll("rect")
        .data(data)
        .transition()
        .duration(1000)
        .attr("y", function(d) {
            return y(d.value + 5);
        })
        .attr("height", function(d) {
            return height - y(d.value) + 5;
        })
        .attr("data-original-title", function(d,i) {
            if (i === 0) {
                return Math.round(d3.min(x_extent)) + " - " + Math.round(qtiles[i]);
            }
            if (i === 8) {
                return Math.round(qtiles[i - 1]) + " - " + Math.round(d3.max(x_extent));
            }
            else {
                return Math.round(qtiles[i - 1]) + " - " + Math.round(qtiles[i]);
            }
        });

    var countyMean = Math.round(d3.mean(metricData[year].values()));
    barChart.select(".mean-county")
        .transition()
        .attr("cx", xScale(countyMean))
        .attr("data-original-title", "County Average: " + countyMean);

}
