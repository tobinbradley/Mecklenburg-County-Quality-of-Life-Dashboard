function lineChart() {
  var width = 720, // default width
      height = 280, // default height
      margins = [15, 15, 20, 65],
      x,
      y;

  function my() {
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

    // svg transform
    var graph = d3.select(".linechart-container").attr("transform", "translate(" + margins[3] + "," + margins[0] + ")");

    // create yAxis
    var xAxis = d3.svg.axis().scale(x).tickSize(-h).ticks(countymean.length).tickFormat(formatYear);
    graph.select(".x.axis")
          .attr("transform", "translate(0," + h + ")")
          .call(xAxis);

    // create left yAxis
    var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left").tickFormat(function(d) { return dataPretty(d, $("#metric").val()); });
    graph.select(".y.axis")
        .call(yAxisLeft);

    // add mean line
    my.linesRemove(".trend-mean");
    my.lineAdd(".trend-mean", "mean");

    // add selected line(s)
    my.linesRemove(".trend-select");
    d3.selectAll(".geom.d3-select").each(function() {
        var item = d3.select(this);
        if ($.isNumeric(item.attr("data-value"))) {
            my.lineAdd(".trend-select", item.attr("data-id"));
        }
    });
  }

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

  my.lineAdd = function(container, id) {
    var graph = d3.select(container);
    var values;
    var years = _.map(_.pluck(metricData, 'year'), function(d) { return parseInt(d.replace("y_", "")); });

    if (container === '.trend-mean') {
        values = _.map(_.pluck(metricData, 'map'), function(d) { return d3.mean(d.values()); });
    }
    else {
        values = _.map(_.pluck(metricData, 'map'), function(d) { return d.get(id); });
    }

    var line = d3.svg.line()
        .x(function(d, i) {
            return x(years[i]);
        })
        .y(function(d) {
            return y(d);
        });

    // add lines and nodes
    var path = graph.append("path")
        .attr("d", line(values, years))
        .attr("data-id", id)
        .attr("class", "metric-hover");
    var totalLength = path.node().getTotalLength();
        path
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
          .transition()
            .duration(250)
            .ease("linear")
            .attr("stroke-dashoffset", 0);

    _.each(values, function (d, i) {
        graph.append("circle")
            .attr("cx", x(years[i]))
            .attr("cy", y(d))
            .attr("r", 5)
            .attr("data-id", id)
            .attr("data-value", d);
    });

    return my;
  };

  my.lineRemove = function(id, container) {
    d3.selectAll(container + " [data-id='" + id + "']").remove();
    return my;
  };

  my.linesRemove = function(container) {
    d3.select(container).selectAll("path, circle").remove();
    return my;
  };

  return my;
}

function drawLineChart(msg) {
    trendChart.container("lineChart");
    trendChart();
}
