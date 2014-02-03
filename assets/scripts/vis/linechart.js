function lineChart() {
  var width = 720, // default width
      height = 280, // default height
      margins = [15, 15, 20, 60],
      x,
      y;

  function my() {

    //console.log(my.width());

    var formatYear = d3.format("04d");
    var w = width - margins[1] - margins[3]; // width
    var h = height - margins[0] - margins[2]; // height
    var countymean = [];
    var years = [];

    _.each(metricData, function(d, i) {
        years.push(d.year.replace("y_", ""));
        countymean.push(d3.mean(d.map.values()));
    });

    my.x(d3.min(years), d3.max(years), w, h);
    my.y(d3.min(years), d3.max(years), w, h);

    var line = d3.svg.line()
        .x(function(d, i) {
            return x(years[i]);
        })
        .y(function(d) {
            return y(d);
        });

    // svg transform
    var graph = d3.select(".linechart-container").attr("transform", "translate(" + margins[3] + "," + margins[0] + ")");

    // create yAxis
    var xAxis = d3.svg.axis().scale(x).tickSize(-h).ticks(countymean.length).tickFormat(formatYear);
    graph.select(".x.axis")
          .attr("transform", "translate(0," + h + ")")
          .call(xAxis);

    // create left yAxis
    var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
    graph.select(".y.axis")
        .call(yAxisLeft);

    // county mean line
    graph.select(".trend-mean path").attr("d", line(countymean, years));

    // county mean circles
    graph.selectAll('.node-mean').remove();
    graph.selectAll(".trend-mean .node")
        .data(countymean)
        .enter().append("circle")
            .attr("class", 'node node-mean')
            .attr("cx", function(d, i) { return x(metricData[i].year.replace("y_", "")); })
            .attr("cy", function(d) { return y(d); })
            .attr("r", 4);
  }

  my.width = function(value) {
    if (!arguments.length) { return width; }
    width = value;
    return my;
  };

  my.height = function(value) {
    if (!arguments.length) { return height; }
    height = value;
    return my;
  };

  my.margins = function(value) {
    if (!arguments.length) { return margins; }
    margins = value;
    return my;
  };

  my.container = function(value) {
    if (!arguments.length) { return margins; }
    var el = document.getElementById(value);
    width = el.offsetWidth;
    height = el.offsetHeight;
    return my;
  };

  my.x = function(min, max, w, h) {
    if (!arguments.length) { return x; }
    x = d3.scale.linear().domain([min, max]).range([0, w]);
    return my;
  };

  my.y = function(min, max, w, h) {
    if (!arguments.length) { return y; }
    y = d3.scale.linear().domain(x_extent).range([h, 0]);
    return my;
  };

  return my;
}

function drawLineChart(msg) {

    trendChart.container("lineChart");
    trendChart();

}

function highlightLine(npa, container) {
    var graph = d3.select(".linechart-container");
    var x = trendChart.x();
    var y = trendChart.y();
    var npavalues = [];
    var years = [];

    _.each(metricData, function(d, i) {
        years.push(d.year.replace("y_", ""));
        npavalues.push(d.map.get(npa));
    });

    var line = d3.svg.line()
        .x(function(d, i) {
            return x(years[i]);
        })
        .y(function(d) {
            return y(d);
        });

    // add lines and nodes
    graph.select(container)
        .append("path")
            .attr("d", line(npavalues, years))
            .attr("data-id", npa);
    _.each(npavalues, function (d, i) {
        graph.selectAll(container)
            .append("circle")
                    .attr("cx", x(metricData[i].year.replace("y_", "")))
                    .attr("cy", y(d))
                    .attr("r", 4)
                    .attr("data-id", npa)
                    .attr("data-year", metricData[i].year.replace("y_", ""))
                    .attr("data-value", d);
    });
}



