var map,                // leaflet map
    quantize,           // d3 quantizer for color breaks
    metricData = [],    // each element is object {'year': the year, 'map': d3 map of data}
    year,               // the currently selected year as array index of metricData
    barchartWidth,      // for responsive charts
    marker,             // marker for geocode
    globals = {},       // stash globals here and clean them up during code gardening sesh
    trendChart,
    valueChart,
    d3Layer,
    x_extent,
    tour,
    precincts = {};
