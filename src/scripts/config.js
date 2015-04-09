// Here we have a bunch of configuration nobs.

// Stick your Google Analytics key here
var gaKey = "UA-48797957-1";

// Here's where to put what you are calling your neighborhoods. We call them NPA,
// you might call them NSA or precinct or even something crazy like "neighborhood".
// Shorter is better lest you run into some unintended wrapping text issues.
var neighborhoodDescriptor = "NPA";
var neighborhoodDefinition = "Neighborhood Profile Areas (NPAs) are geographic areas used for the organization and presentation of data in the Quality of Life Study. The boundaries were developed with community input and are based on one or more Census block groups.";

// The URL for your base map tiles.
// Here's a good place to find some:
// http://leaflet-extras.github.io/leaflet-providers/preview/
// Ex: http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png
// You want to change this - our base tiles only cover Mecklenburg County NC.
var baseTilesURL = "http://tiles.mcmap.org/meckbase/{z}/{x}/{y}.png";

// Server-side processor for feedback.
// Post arguments passed to the server: email, url, agent (browser info), subject, to, message
var contactConfig = {
    "to": "tobin.bradley@gmail.com",
    "url": "/utilities/feedback.php"
};

// The basic geographic setup for your map: the minimum zoom level,
// maximum zoom level, and the starting zoom level, the map center point, and when
// the base tiles should become visible.
var mapGeography = {
        minZoom: 9,
        maxZoom: 17,
        defaultZoom: 10,
        center: [35.260, -80.827]
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

// we're going to export a few of our vars for the node build/watch process. Done in a try/catch
// so a browser reading this will barf quietly to itself.
try {
    exports.neighborhoodDescriptor = neighborhoodDescriptor;
    exports.gaKey = gaKey;
}
catch(err) {}


// ***********************************************************
// Ye Olde Metric Configuration
//
// Here's the format:
// "m<the metric number>": {
//        "metric"        the metric number
//        "type"          Type of calculation to be performed (determines files to fetch). Options are sum, mean, and weighted.
//                            sum: r<metric>.csv
//                            mean: n<metric>.csv
//                            weighted: r<metric>.csv and d<metric>.csv
//        "category"      the category of the metric
//        "title"         metric descriptive title
//        "accuracy"      [optional] set true if metric has an accuracy file (i.e. m<metric>-accuracy.csv)
//        "label"         [optional] metric unit information
//        "decimals"      [optional] number of decimal places to display (default is 0)
//        "prefix"        [optional] prefix for the number, like '$'
//        "suffix"        [optional] suffix for the number, like '%'
//        "raw_label"     [optional] label for raw number if available (also makes raw number visible)
//        "scale"         [optional] An array of custom data scale breaks, ommitting the top and bottom bounds.
//                                   Must match the number of color breaks. For example, if you specified
//                                   5 color breaks, your array might be [100, 2000, 4000, 10000].
//                                   Non-specified scales will get a runtime-computed linear scale.
// }
// ***********************************************************

var metricConfig = {
 "m2": {
  "metric": "2",
  "accuracy": "true",
  "category": "Character",
  "label": "Years",
  "title": "Age of Residents",
  "type": "weighted"
 },
 "m1": {
  "metric": "1",
  "category": "Character",
  "label": "Acres",
  "title": "Area",
  "type": "sum"
 },
 "m13": {
  "metric": "13",
  "accuracy": "true",
  "category": "Character",
  "suffix": "%",
  "title": "Population - Older Adult",
  "type": "weighted"
 },
 "m12": {
  "metric": "12",
  "accuracy": "true",
  "category": "Character",
  "suffix": "%",
  "title": "Population - Youth",
  "type": "weighted"
 },
 "m47": {
  "metric": "47",
  "category": "Character",
  "label": "People per Acre",
  "raw_label": "People",
  "title": "Population Density",
  "type": "weighted"
 },
 "m17": {
  "metric": "17",
  "category": "Character",
  "suffix": "%",
  "title": "Race/Ethnicity - All Other Races",
  "decimals": 1,
  "type": "weighted"
 },
 "m16": {
  "metric": "16",
  "category": "Character",
  "suffix": "%",
  "title": "Race/Ethnicity - Asian",
  "decimals": 1,
  "type": "weighted"
 },
 "m15": {
  "metric": "15",
  "category": "Character",
  "suffix": "%",
  "title": "Race/Ethnicity - Black or African American",
  "decimals": 1,
  "type": "weighted"
 },
 "m18": {
  "metric": "18",
  "category": "Character",
  "suffix": "%",
  "title": "Race/Ethnicity - Hispanic or Latino",
  "decimals": 1,
  "type": "weighted"
 },
 "m14": {
  "metric": "14",
  "category": "Character",
  "suffix": "%",
  "title": "Race/Ethnicity - White or Caucasian",
  "decimals": 1,
  "type": "weighted"
 },
 "m11": {
  "metric": "11",
  "category": "Character",
  "suffix": "%",
  "raw_label": "Acres",
  "title": "Vacant Land",
  "decimals": 1,
  "type": "weighted"
 },
 "m42": {
  "metric": "42",
  "category": "Economy",
  "label": "Years",
  "title": "Commercial Building Age",
  "type": "weighted"
 },
 "m19": {
  "metric": "19",
  "category": "Economy",
  "label": "Permits per 100 Acres",
  "raw_label": "Permits",
  "title": "Commercial Construction",
  "decimals": 1,
  "type": "weighted"
 },
 "m41": {
  "metric": "41",
  "category": "Economy",
  "label": "Average Square Feet",
  "raw_label": "Square Feet",
  "title": "Commercial Space",
  "type": "weighted"
 },
 "m38": {
  "metric": "38",
  "accuracy": "true",
  "category": "Economy",
  "suffix": "%",
  "title": "Employment",
  "type": "weighted"
 },
 "m80": {
  "metric": "80",
  "category": "Economy",
  "suffix": "%",
  "title": "Food and Nutrition Services",
  "type": "weighted"
 },
 "m37": {
  "metric": "37",
  "accuracy": "true",
  "category": "Economy",
  "prefix": "$",
  "title": "Household Income",
  "type": "weighted"
 },
 "m75": {
  "metric": "75",
  "category": "Economy",
  "label": "Jobs per Acre",
  "raw_label": "Jobs",
  "title": "Job Density",
  "decimals": 1,
  "type": "weighted"
 },
 "m79": {
  "metric": "79",
  "category": "Economy",
  "suffix": "%",
  "raw_label": "Units",
  "title": "Proximity to Financial Services",
  "type": "weighted"
 },
 "m20": {
  "metric": "20",
  "accuracy": "true",
  "category": "Education",
  "suffix": "%",
  "title": "Education Level - Bachelor's Degree",
  "type": "weighted"
 },
 "m39": {
  "metric": "39",
  "accuracy": "true",
  "category": "Education",
  "suffix": "%",
  "title": "Education Level - High School Diploma",
  "type": "weighted"
 },
 "m65": {
  "metric": "65",
  "category": "Education",
  "suffix": "%",
  "title": "High School Graduation Rate",
  "type": "weighted"
 },
 "m51": {
  "metric": "51",
  "category": "Education",
  "suffix": "%",
  "title": "Library Card Holders",
  "type": "weighted"
 },
 "m67": {
  "metric": "67",
  "category": "Education",
  "suffix": "%",
  "title": "Neighborhood School Attendance ",
  "type": "weighted"
 },
 "m21": {
  "metric": "21",
  "category": "Education",
  "suffix": "%",
  "raw_label": "Units",
  "title": "Proximity to Early Care and Education",
  "type": "weighted"
 },
 "m22": {
  "metric": "22",
  "category": "Education",
  "suffix": "%",
  "raw_label": "Units",
  "title": "Proximity to School-Age Care",
  "type": "weighted"
 },
 "m66": {
  "metric": "66",
  "category": "Education",
  "suffix": "%",
  "title": "Student Absenteeism",
  "type": "weighted"
 },
 "m62": {
  "metric": "62",
  "category": "Education",
  "suffix": "%",
  "title": "Test Proficiency - Elementary School",
  "decimals": 1,
  "type": "weighted"
 },
 "m64": {
  "metric": "64",
  "category": "Education",
  "suffix": "%",
  "title": "Test Proficiency - High School",
  "decimals": 1,
  "type": "weighted"
 },
 "m63": {
  "metric": "63",
  "category": "Education",
  "suffix": "%",
  "title": "Test Proficiency - Middle School",
  "decimals": 1,
  "type": "weighted"
 },
 "m52": {
  "metric": "52",
  "category": "Engagement",
  "label": "Calls per 100 People",
  "raw_label": "Calls",
  "title": "311 Requests",
  "decimals": 1,
  "type": "weighted"
 },
 "m50": {
  "metric": "50",
  "category": "Engagement",
  "suffix": "%",
  "raw_label": "Households",
  "title": "Arts and Culture Participation",
  "type": "weighted"
 },
 "m72": {
  "metric": "72",
  "category": "Engagement",
  "label": "Residents serving per 1,000 People",
  "raw_label": "People",
  "title": "Municipal Board/Committee Participation",
  "type": "weighted"
 },
 "m73": {
  "metric": "73",
  "category": "Engagement",
  "label": "Organizations",
  "title": "Neighborhood Organizations",
  "type": "sum"
 },
 "m48": {
  "metric": "48",
  "category": "Engagement",
  "suffix": "%",
  "raw_label": "People",
  "title": "Voter Participation",
  "decimals": 1,
  "type": "weighted"
 },
 "m43": {
  "metric": "43",
  "category": "Environment",
  "suffix": "%",
  "raw_label": "Miles",
  "title": "Adopt-a-Stream Participation",
  "type": "weighted"
 },
 "m10": {
  "metric": "10",
  "accuracy": "true",
  "category": "Environment",
  "suffix": "%",
  "title": "Commuters Driving Alone",
  "raw_label": "",
  "type": "weighted"
 },
 "m26": {
  "metric": "26",
  "category": "Environment",
  "label": "Kilowatt hours per Month per unit",
  "raw_label": "Kilowatt hours per Month",
  "title": "Energy Consumption - Electricity",
  "type": "weighted"
 },
 "m77": {
  "metric": "77",
  "category": "Environment",
  "label": "Therms per Month per unit",
  "raw_label": "Therms per Month",
  "title": "Energy Consumption - Natural Gas",
  "type": "weighted"
 },
 "m4": {
  "metric": "4",
  "category": "Environment",
  "suffix": "%",
  "raw_label": "Acres",
  "title": "Impervious Surface",
  "decimals": 1,
  "type": "weighted"
 },
 "m23": {
  "metric": "23",
  "category": "Environment",
  "suffix": "%",
  "raw_label": "Units",
  "title": "Residential Recycling",
  "decimals": 1,
  "type": "weighted"
 },
 "m24": {
  "metric": "24",
  "category": "Environment",
  "label": "Pounds per Day per unit",
  "raw_label": "Pounds per Day",
  "title": "Residential Solid Waste",
  "decimals": 1,
  "type": "weighted"
 },
 "m25": {
  "metric": "25",
  "category": "Environment",
  "suffix": "%",
  "raw_label": "Tons",
  "title": "Residential Solid Waste Diversion",
  "decimals": 1,
  "type": "weighted"
 },
 "m3": {
  "metric": "3",
  "category": "Environment",
  "suffix": "%",
  "raw_label": "Acres",
  "title": "Tree Canopy",
  "decimals": 1,
  "type": "weighted"
 },
 "m27": {
  "metric": "27",
  "category": "Environment",
  "label": "Gallons per Day per unit",
  "raw_label": "Gallons per Day",
  "title": "Water Consumption",
  "type": "weighted"
 },
 "m57": {
  "metric": "57",
  "category": "Health",
  "label": "Years",
  "title": "Age of Death",
  "type": "weighted"
 },
 "m54": {
  "metric": "54",
  "category": "Health",
  "suffix": "%",
  "title": "Births to Adolescents",
  "decimals": 1,
  "type": "weighted"
 },
 "m55": {
  "metric": "55",
  "category": "Health",
  "suffix": "%",
  "title": "Low Birthweight",
  "decimals": 1,
  "type": "weighted"
 },
 "m56": {
  "metric": "56",
  "category": "Health",
  "suffix": "%",
  "title": "Prenatal Care",
  "decimals": 1,
  "type": "weighted"
 },
 "m28": {
  "metric": "28",
  "category": "Health",
  "suffix": "%",
  "raw_label": "Units",
  "title": "Proximity to Low-Cost Health Care",
  "type": "weighted"
 },
 "m74": {
  "metric": "74",
  "category": "Health",
  "suffix": "%",
  "raw_label": "Units",
  "title": "Proximity to Public Outdoor Recreation",
  "type": "weighted"
 },
 "m45": {
  "metric": "45",
  "category": "Health",
  "suffix": "%",
  "raw_label": "Units",
  "title": "Proximity to a Grocery Store",
  "type": "weighted"
 },
 "m81": {
  "metric": "81",
  "category": "Health",
  "suffix": "%",
  "title": "Public Health Insurance",
  "type": "weighted"
 },
 "m29": {
  "metric": "29",
  "accuracy": "true",
  "category": "Housing",
  "suffix": "%",
  "title": "Home Ownership",
  "type": "weighted"
 },
 "m76": {
  "metric": "76",
  "category": "Housing",
  "prefix": "$",
  "title": "Home Sales Price",
  "type": "weighted"
 },
 "m7": {
  "metric": "7",
  "category": "Housing",
  "label": "Years",
  "title": "Housing Age",
  "type": "weighted"
 },
 "m5": {
  "metric": "5",
  "category": "Housing",
  "label": "Units per Acre",
  "raw_label": "Units",
  "title": "Housing Density",
  "decimals": 1,
  "type": "weighted"
 },
 "m6": {
  "metric": "6",
  "category": "Housing",
  "label": "Average Sqft",
  "title": "Housing Size",
  "type": "weighted"
 },
 "m40": {
  "metric": "40",
  "accuracy": "true",
  "category": "Housing",
  "prefix": "$",
  "title": "Rental Costs",
  "type": "weighted"
 },
 "m53": {
  "metric": "53",
  "category": "Housing",
  "suffix": "%",
  "raw_label": "Units",
  "title": "Rental Houses",
  "type": "weighted"
 },
 "m69": {
  "metric": "69",
  "category": "Housing",
  "suffix": "%",
  "raw_label": "Units",
  "title": "Residential Foreclosures",
  "decimals": 1,
  "type": "weighted"
 },
 "m8": {
  "metric": "8",
  "category": "Housing",
  "label": "Permits per 100 Acres",
  "raw_label": "Permits",
  "title": "Residential New Construction",
  "decimals": 1,
  "type": "weighted"
 },
 "m31": {
  "metric": "31",
  "accuracy": "true",
  "category": "Housing",
  "suffix": "%",
  "title": "Residential Occupancy",
  "type": "weighted"
 },
 "m9": {
  "metric": "9",
  "category": "Housing",
  "label": "Permits per 100 Acres",
  "raw_label": "Permits",
  "title": "Residential Renovation",
  "decimals": 1,
  "type": "weighted"
 },
 "m30": {
  "metric": "30",
  "category": "Housing",
  "suffix": "%",
  "raw_label": "Units",
  "title": "Single-Family Housing",
  "type": "weighted"
 },
 "m61": {
  "metric": "61",
  "category": "Safety",
  "label": "Calls per 1,000 People",
  "raw_label": "Calls",
  "title": "Calls for Animal Control",
  "decimals": 1,
  "type": "weighted"
 },
 "m59": {
  "metric": "59",
  "category": "Safety",
  "label": "Crimes per 1,000 People",
  "raw_label": "Crimes",
  "title": "Crime - Property",
  "decimals": 1,
  "type": "weighted"
 },
 "m58": {
  "metric": "58",
  "category": "Safety",
  "label": "Crimes per 1,000 People",
  "raw_label": "Crimes",
  "title": "Crime - Violent",
  "decimals": 1,
  "type": "weighted"
 },
 "m60": {
  "metric": "60",
  "category": "Safety",
  "label": "Calls per 1,000 People",
  "raw_label": "Calls",
  "title": "Disorder-related Calls",
  "decimals": 1,
  "type": "weighted"
 },
 "m78": {
  "metric": "78",
  "category": "Safety",
  "label": "Calls per 1,000 People",
  "raw_label": "Calls",
  "title": "Fire Calls for Service",
  "decimals": 1,
  "type": "weighted"
 },
 "m32": {
  "metric": "32",
  "category": "Safety",
  "label": "Violations per 100 Units",
  "raw_label": "Violations",
  "title": "Nuisance Violations",
  "decimals": 1,
  "type": "weighted"
 },
 "m34": {
  "metric": "34",
  "category": "Transportation",
  "label": "Index Value (1-3)",
  "title": "Bicycle Friendliness",
  "decimals": 1,
  "type": "weighted"
 },
 "m33": {
  "metric": "33",
  "accuracy": "true",
  "category": "Transportation",
  "suffix": "%",
  "title": "Long Commute",
  "type": "weighted"
 },
 "m36": {
  "metric": "36",
  "category": "Transportation",
  "suffix": "%",
  "raw_label": "Units",
  "title": "Proximity to Public Transportation",
  "type": "weighted"
 },
 "m70": {
  "metric": "70",
  "category": "Transportation",
  "suffix": "%",
  "raw_label": "Miles",
  "title": "Sidewalk Availability",
  "decimals": 1,
  "type": "weighted"
 },
 "m35": {
  "metric": "35",
  "category": "Transportation",
  "label": "Index Value (1-3)",
  "title": "Street Connectivity",
  "decimals": 2,
  "type": "weighted"
 },
 "m44": {
  "metric": "44",
  "category": "Transportation",
  "label": "Boardings per Available Route",
  "raw_label": "Average Weekly Boardings",
  "title": "Transit Ridership",
  "type": "weighted"
 }
};
