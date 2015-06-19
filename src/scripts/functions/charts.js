// ****************************************
// Line chart (trend) in chart.js
// ****************************************
function lineChartData() {
    var npaMean = [],
        countyMean = [],
        keys = _.without(_.keys(model.metric[0]), "id");

    // get stats
    _.each(model.years, function(year) {
        countyMean.push(dataCrunch(metricConfig[model.metricId].type, year));
        npaMean.push(dataCrunch(metricConfig[model.metricId].type, year, model.selected));
    });

    // make sure selected stuff really has a value
    _.each(npaMean, function(el) {
        if (!$.isNumeric(el)) {
            npaMean = null;
        }
    });

    var data = {
        labels: [],
        datasets: [
            {
                label: 'Selected <a href="javascript:void(0)" tabindex="0" class="meta-definition" data-toggle="popover" data-content="' + neighborhoodDefinition + '">' + neighborhoodDescriptor + 's</a>',
                fillColor : "rgba(255,164,0,0.2)",
                strokeColor : "rgba(255,164,0,1)",
                pointColor : "rgba(255,164,0,1)",
                pointStrokeColor : "#fff",
                pointHighlightFill : "#fff",
                pointHighlightStroke : "rgba(255,164,0,1)",
                data :[]
            },
            {
                label: "County",
                fillColor : "rgba(220,220,220,0.5)",
                strokeColor : "rgba(220,220,220,1)",
                pointColor : "rgba(220,220,220,1)",
                pointStrokeColor : "#fff",
                pointHighlightFill : "#fff",
                pointHighlightStroke : "rgba(220,220,220,1)",
                data : []
            }
        ]
    };

    _.each(countyMean, function(el, i) {
        data.labels.push(model.years[i].replace("y_", ""));
        if (npaMean !== null) { data.datasets[0].data.push(Math.round(npaMean[i] * 10) / 10); }
        data.datasets[1].data.push(Math.round(el * 10) / 10);
    });

    // remove select mean if no values are there
    if (!npaMean || npaMean === null) { data.datasets.shift(); }

    return data;
}

function lineChartCreate() {
    if (model.years.length > 1) {
        if (window.myLine) { window.myLine.destroy(); }
        var ctx = document.getElementById("lineChart").getContext("2d");
        window.myLine = new Chart(ctx).Line(lineChartData(), {
            responsive: true,
            maintainAspectRatio: true,
            animation: true,
            showTooltips: true,
            tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= dataPretty(value, model.metricId) %>",
            multiTooltipTemplate: "<%= dataPretty(value, model.metricId) %>",
            scaleLabel: "<%= dataFormat(dataRound(Number(value), 2), model.metricId) %>",
            legendTemplate : '<% for (var i=0; i<datasets.length; i++){%><span class="title"  style="border-color:<%=datasets[i].strokeColor%>"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></span><%}%>'
        });
        $(".lineChartLegend").html(myLine.generateLegend());
    }
}


// ****************************************
// D3 Bar Chart
// ****************************************
function barChart() {
    var width = 720, // default width
        height = 220, // default height
        margins = [2, 30, 30, 30],
        x,
        y,
        xScale;

    function my() {
        var keys = Object.keys(model.metric[0]),
            data = quantizeCount(_.map(model.metric, function(num) { if ($.isNumeric(num[keys[model.year + 1]])) { return Number(num[keys[model.year + 1]]); } })),
            countyMedian = median(_.map(model.metric, function(num){ if ($.isNumeric(num[keys[model.year + 1]])) { return Number(num[keys[model.year + 1]]); } })),
            qtiles = quantize.quantiles(),
            theMetric = $("#metric").val(),
            w = width - margins[1] - margins[3],
            h = height - margins[0] - margins[2];

        var container = $("#barChart");

        // x/y/scale stuff
        my.x(w, data.length);
        my.y(h, _.max(data, function(d){ return d.value; }).value) ;
        my.xScale(w, x_extent);

        // axis labeling
        var tickValues = quantize.quantiles();
        tickValues.push(x_extent[1]);
        tickValues.unshift(x_extent[0]);
        var xAxis = d3.svg.axis()
            .scale(xScale)
            .tickFormat(function(d) { return dataPretty(d, $("#metric").val()); })
            .orient("bottom")
            .tickValues(tickValues);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(4);

        // set up bar chart
        graph = d3.select(".barchart");
        graph.select("g.barchart-container")
            .attr("transform", "translate(" + margins[3] + "," + margins[0] + ")");
        graph.select(".x.axis")
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis);

        // make line longer for every other x axis tick
        // the text is shifted down in CSS via a transform
        graph.selectAll(".x.axis line").filter(function(d, i) { return i & 1; })
            .attr("y2", "15");

        // scaling factor for bar width
        var scaleFactor = w / (_.last(qtiles) - qtiles[0]);

        // create original rects
        var barContainer = graph.select(".bar-container");
        barContainer.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", function(d) {
                return "bar chart-tooltips metric-hover " + d.key;
            })
            .attr("data-quantile", function(d) {
                return d.key;
            })
            .attr("data-toggle", "tooltip");

        // set bar position, height, and tooltip info
        graph.selectAll("rect")
            .data(data)
            .transition()
            .duration(1000)
            .attr("x", function(d, i) {
                return (qtiles[i] - qtiles[0]) * scaleFactor;
            })
            .attr("y", function(d) {
                return y(d.value);
            })
            .attr("width", function(d,i) {
                return (qtiles[i + 1] - qtiles[i]) * scaleFactor;
            })
            .attr("height", function(d) {
                return h - y(d.value) + 6;
            })
            .attr("data-span", function(d, i) {
                if (i === 0) {
                    return d3.min(x_extent) + " - " + qtiles[i];
                }
                if (i === colorbreaks - 1) {
                    return qtiles[i - 1] + " - " + d3.max(x_extent);
                } else {
                    return qtiles[i - 1] + " - " + qtiles[i];
                }
            })
            .attr("data-value", function(d) { return d.value; });




        $(".bar").tooltip({
          html: true,
          title: function() {
              var sel = $(this);
              var theRange = _.map(sel.attr("data-span").split("-"), function(num){ return dataPretty(num, $("#metric").val()); });
              //return "<p class='tip'><span><strong>" + theRange.join(" to ") + "</strong></span><br>" + sel.attr("data-value") + " " + neighborhoodDescriptor + "(s)</p>";
              return "<p class='tip'><span><strong>" + sel.attr("data-value") + " " + neighborhoodDescriptor + "(s)</strong></span></p>";
          },
          container: 'body'
        });

        // chart rect click event
        graph.selectAll("rect").on("click", function(el, i) {
            var arr = [];
            $('.geom.' + el.key).each(function(){
                arr.push($(this).attr("data-id"));
            });
            model.selected = _.union(model.selected, arr);
        });

        // county mean indicator
        graph.select(".value-mean line")
            .transition()
            .attr("y1", y(0))
            .attr("y2", 0)
            .attr("x1", xScale(countyMedian))
            .attr("x2", xScale(countyMedian));

        my.pointerMove();

        // store chart with for responsiveness
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
      //x = d3.scale.linear().domain([0, max]).range([0, width]);
      x = d3.scale.linear().range([0, width]);
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
            .append("circle")
            .attr("cx", xScale(value))
            .attr("cy", y(0))
            .attr("r", 4)
            .attr("data-id", id);
        return my;
    };

    my.selectedPointer = function (container) {
        // clear out old stuff
        d3.selectAll(".value-select circle").remove();
        if (model.selected.length > 0) {
            var data = _.filter(model.metric, function(d) { return _.contains(model.selected, d.id); });
            var keys = Object.keys(data[0]);

            d3.select(container).selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function(d) {
                    if ($.isNumeric(d[keys[model.year + 1]])) {
                        return xScale(d[keys[model.year + 1]]);
                    }
                })
                .attr("cy", y(0))
                .attr("r", 5)
                .attr("class", "metric-hover")
                .attr("opacity", function(d) { if ($.isNumeric(d[keys[model.year + 1]])) { return "1"; } else { return "0"; }  })
                .attr("data-id", function(d) { return d.id; })
                .attr("data-value", function(d) { if ($.isNumeric(d[keys[model.year + 1]])) { return d[keys[model.year + 1]]; } else { return ""; }  });
        }

        $(".value-select circle").tooltip({
            html: true,
            title: function() {
                var sel = $(this),
                    num = "";
                if ($.isNumeric(sel.attr("data-value"))) {
                    num = "<br>" + dataPretty(sel.attr("data-value"), $("#metric").val());
                }
                return "<p class='tip'><strong><span>" + neighborhoodDescriptor + " " + sel.attr("data-id") + "</strong>" + num + "</span></p>";
            },
            container: 'body'
        });
    };

    my.pointerRemove = function (id, container) {
        d3.selectAll(".barchart " + container + " [data-id='" + id + "']").remove();
        return my;
    };

    my.pointerMove = function() {
        d3.selectAll(".geom.d3-select")
            .each(function(d) {
                var item = d3.select(this);

                if ($.isNumeric(item.attr("data-value"))) {

                    var theData = _.filter(model.metric, function(el) { return el.id == item.attr('data-id'); }),
                        keys = Object.keys(model.metric[0]),
                        theX = xScale(theData[0][keys[model.year + 1]]);

                    // add pointer if it doesn't exist
                    if (d3.select(".value-select circle[data-id='" + item.attr("data-id") + "']")[0][0] === null) {
                        my.pointerAdd(item.attr("data-id"), item.attr("data-value"), ".value-select");
                    }
                    var rect = d3.select(".value-select rect[data-id='" + item.attr("data-id") + "']");
                    d3.selectAll(".value-select circle[data-id='" + item.attr("data-id") + "']")
                        .transition()
                        .duration(1000)
                        .attr("cx", theX)
                        .attr("opacity", "1");
                }
                else {
                    d3.selectAll(".value-select [data-id='" + item.attr("data-id") + "']")
                        .attr("opacity", "0");
                }
            });

        return my;
    };

    return my;
}


// ****************************************
// Initialize the bar chart
// ****************************************
function drawBarChart() {
    valueChart.container("barChart");
    valueChart();
}
