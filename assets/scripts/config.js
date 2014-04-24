// General Info
// * install node and start the project
// * convert neighborhoods to topojson (id field)
// *

// Number of color breaks/quantiles in the map and bar chart.
// Note the rule is 5 to 7 color breaks on a choropleth map. Don't be
// that guy. Nobody likes that guy.
//
// You will also want to monkey about in assets/less/vis.less under
// "chart and map colors". A good guide for color breaks is
// http://colorbrewer2.org
var colorbreaks = 6;

// The URL for your base map tiles.
// Here's a good place to find some:
// http://leaflet-extras.github.io/leaflet-providers/preview/
// Ex: http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
var baseTilesURL = "http://mcmap.org:3000/meckbase/{z}/{x}/{y}.png";

// The basic geographic setup for your map: the minimum zoom level,
// maximum zoom level, and the starting zoom level and map ceter point.
var mapGeography = {
        minZoom: 9,
        maxZoom: 17,
        defaultZoom: 10,
        center: [35.260, -80.827]
    };

// Neighborhoods name in your TopoJSON file.
var neighborhoods = "npa";

// If you have an additional data layer in your TopoJSON file, name it here.
// Otherwise comment it out.
var overlay = "istates";

// Need something to customize search types

// Need something to customize handling search returns

