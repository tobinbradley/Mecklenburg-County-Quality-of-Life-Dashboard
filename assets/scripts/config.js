// Here we have a bunch of configuration nobs.

// Stick your Google Analytics key here
var gaKey = "UA-48797957-1";

// Here's where to put what you are calling your neighborhoods. We call them NPA,
// you might call them NSA or precinct or even something crazy like "neighborhood".
// Shorter is better lest you run into some unintended wrapping text issues.
var neighborhoodDescriptor = "NPA";

// The URL for your base map tiles.
// Here's a good place to find some:
// http://leaflet-extras.github.io/leaflet-providers/preview/
// Ex: http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
// You want to change this - our base tiles only cover Mecklenburg County NC.
var baseTilesURL = "http://mcmap.org:3000/meckbase/{z}/{x}/{y}.png";

// The basic geographic setup for your map: the minimum zoom level,
// maximum zoom level, and the starting zoom level, the map center point, and when
// the base tiles should become visible.
var mapGeography = {
        minZoom: 9,
        maxZoom: 17,
        defaultZoom: 10,
        center: [35.260, -80.827],
        baseTileVisible: 15
    };

// Neighborhoods name in your TopoJSON file. This is usually the name of the shapefile
// or geojson file you converted from.
var neighborhoods = "npa";

// If you have an additional data layer in your TopoJSON file, name it here.
// Otherwise comment it out.
var overlay = "istates";

// Number of color breaks/quantiles in the map and bar chart.
// Note the rule is 5 to 7 color breaks on a choropleth map. Don't be
// that guy. Nobody likes that guy.
//
// You will need to monkey about in assets/less/vis.less under
// "chart and map colors" if you change this number. A good guide for color
// breaks is at http://colorbrewer2.org
var colorbreaks = 5;

// Here you can set some behaviors for how your variables are formatted in terms of
// rounding, commas, prefixes/suffixes, etc. pct puts a % after the value, money
// puts a $ before the value, and year won't stick commas in the number.
//
// If you want to add new data types or change how things are handled, check out
// the dataPretty in assets/scripts/functions/functions.js
var metricPct = ["m4", "m6", "m7", "m8", "m9", "m10", "m11", "m12", "m13", "m18", "m19", "m20", "m21", "m32", "m33", "m34", "m35", "m36", "m37", "m38", "m39", "m40", "m41", "m42", "m43", "m44", "m45", "m47", "m48", "m49", "m50", "m58", "m59", "m60", "m61", "m62", "m66", "m67", "m68", "m71", "m73", "m75", "m76", "m77", "m78", "m80"],
    metricMoney = ["m17","m57","m63"],
    metricYear = ["m24", "m53"],
    metricRidiculousDecimals = ["m55", "m56"];

// Here we have a list of metrics that are raw numbers and are therefore "summable"
// (i.e. will show total value for study area and selected). The totalling function will
// totally check the metricRaw too. Totally.
var metricSummable = ["m1", "m22"];

// The following things are for crazy people.
//
// If you have supplimental accuracy information for one of your metrics, you
// can include that in a file with the data formatted [*]-accuracy.csv and then
// put the metric value in this array and it'll show in the tooltip below the
// number. You will probably want to make this an empty array to disable it, but
// we have crazy people here. It will appear in the Show Data table.
//
// You can also have a raw number associated with a metric. Associate the raw
// number with the metric via "<metrics>": "<raw metric>". This will appear in the
// Show Data table along with weighted averages that'll generally be almost the
// same as the non-weighted averages but CRAZY PEOPLE.
//
// You should probably set these variables empty and then shake your head ruefully.
//
// var metricAccuracy = [];
// var metricRaw = {};
var metricAccuracy = ["m2", "m67"];
var metricRaw = {"m2": "m84", "m75": "m85", "m73": "m86", "m5": "m51", "m54": "m88", "m53": "m89", "m55": "m90", "m67": "m92", "m56": "m91"};


// we're going to export a few of our vars for the node build/watch process. Done in a try/catch
// so a browser reading this will barf quietly to itself.
try {
    exports.neighborhoodDescriptor = neighborhoodDescriptor;
    exports.gaKey = gaKey;
}
catch(err) {}
