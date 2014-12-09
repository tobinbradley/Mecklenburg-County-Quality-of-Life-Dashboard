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
var metricPct = ["m13", "m16", "m15", "m18", "m17", "m14", "m11", "m12", "m20", "m39", "m51", "m21", "m22", "m50", "m43", "m10", "m4", "m23", "m25", "m3", "m54", "m55", "m56", "m28", "m45", "m46", "m53", "m31", "m30", "m33", "m36"],
    metricMoney = ["m37", "m40"];


// Here we have a list of metrics that are raw numbers and are therefore "summable"
// (i.e. will show total value for study area and selected). The totalling function will
// totally check the metricRaw too. Totally.
var metricSummable = ["r1", "r47", "r16", "r15", "r18", "r17", "r14", "r11", "r41", "r19", "r51", "r21", "r22", "r52", "r50", "r43", "r4", "r26", "r23", "r24", "r25", "r27", "r3", "r28", "r45", "r46", "r5", "r32", "r53", "r8", "r9", "r30", "r36"];

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
var metricAccuracy = ["m2", "m13", "m12", "m38", "m37", "m20", "m39", "m10", "m29", "m40", "m31", "m33"];


// Even more metric suffixes. I can't believe it either.
var metricUnits = {
    "m2": "Years",
    "r1": "Acres",
    "m47": "People per Acre",
    "r47": "People",
    "r16": "People",
    "r15": "People",
    "r18": "People",
    "r17": "People",
    "r14": "People",
    "r11": "Acres",
    "m42": "Years",
    "m41": "Square Feet",
    "r41": "Square Feet",
    "m19": "Permits per 100 Acres",
    "r19": "Permits",
    "r51": "People",
    "r21": "Units",
    "r22": "Units",
    "m52": "Calls per 100 People",
    "r52": "Calls",
    "r50": "Households",
    "r43": "Miles",
    "r4": "Acres",
    "m26": "Kilowatt hours per Month (per unit)",
    "r26": "Kilowatt hours per Month",
    "r23": "Units",
    "m24": "Pounds per Day (per unit)",
    "r24": "Pounds per Day",
    "r25": "Tons",
    "m27": "Gallons per Day (per unit)",
    "r27": "Gallons per Day",
    "r3": "Acres",
    "m57": "Years",
    "r28": "Units",
    "r45": "Units",
    "r46": "Units",
    "m7": "Years",
    "m5": "Units per Acre",
    "r5": "Units",
    "m6": "Average Sqft",
    "m32": "Violations per 100 Units",
    "r32": "Violations",
    "r53": "Units",
    "m8": "Permits per 100 Acres",
    "r8": "Permits",
    "m9": "Permits per 100 Acres",
    "r9": "Permits",
    "r30": "Units",
    "r36": "Units"
};

// we're going to export a few of our vars for the node build/watch process. Done in a try/catch
// so a browser reading this will barf quietly to itself.
try {
    exports.neighborhoodDescriptor = neighborhoodDescriptor;
    exports.gaKey = gaKey;
}
catch(err) {}
