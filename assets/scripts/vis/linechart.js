function drawLineChart(msg) {
    var m = [15, 15, 20, 50]; // margins
    var w = $("#lineChart").parent().width() - m[1] - m[3]; // width
    var h = 150 - m[0] - m[2]; // height

    var formatYear = d3.format("04d");

    var countymean = [];
    var years = [];

    _.each(metricData, function(d, i) {
        years.push(d.year.replace("y_", ""));
        countymean.push(d3.mean(d.map.values()));
    });

    var x = d3.scale.linear().domain([d3.min(years), d3.max(years)]).range([0, w]);
    var y = d3.scale.linear().domain(x_extent).range([h, 0]);

    // create a line function that can convert data[] into x and y points
    var line = d3.svg.line()
        .x(function(d, i) {
            return x(years[i]);
        })
        .y(function(d) {
            return y(d);
        });

    // Add an SVG element with the desired dimensions and margin.
    var graph = d3.select(".linechart-container").attr("transform", "translate(" + m[3] + "," + m[0] + ")");



    // create yAxis
    var xAxis = d3.svg.axis().scale(x).tickSize(-h).ticks(countymean.length).tickFormat(formatYear);
    //Add the x-axis.
    graph.select(".x.axis")
          .attr("transform", "translate(0," + h + ")")
          .call(xAxis);


    // create left yAxis
    var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
    // Add the y-axis to the left
    graph.select(".y.axis")
        .call(yAxisLeft);


    // Add the line by appending an svg:path element with the data line we created above
    // do this AFTER the axes above so that the line is above the tick-lines
    graph.select(".trend-mean path").attr("d", line(countymean, years));

    // make circles
    graph.selectAll('.node-mean').remove();
    graph.selectAll(".trend-mean .node")
        .data(countymean)
        .enter().append("circle")
            .attr("class", 'node node-mean')
            .attr("cx", function(d, i) { return x(metricData[i].year.replace("y_", "")); })
            .attr("cy", function(d) { return y(d); })
            .attr("r", 4);
}

function addLine(container, theClass, data) {
    // set x and y scaling
    var m = [15, 15, 20, 50]; // margins
    var w = $("#lineChart").parent().width() - m[1] - m[3]; // width
    var h = 150 - m[0] - m[2]; // height
    var x = d3.scale.linear().domain([d3.min(years), d3.max(years)]).range([0, w]);
    var y = d3.scale.linear().domain(x_extent).range([h, 0]);

    // add line

    // add nodes

    // add node functionality
}
