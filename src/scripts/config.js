// Here's where to put what you are calling your neighborhoods. We call them NPA,
// you might call them NSA or precinct or even something crazy like "neighborhood".
// Shorter is better lest you run into some unintended wrapping text issues.
var neighborhoodDefinition = "Neighborhood Profile Areas (NPAs) are geographic areas used for the organization and presentation of data in the Quality of Life Study. The boundaries were developed with community input and are based on one or more Census block groups.";
var neighborhoodDescriptor = "";

// The URL(s) for your base map tiles.
// Here's a good place to find some:
// http://leaflet-extras.github.io/leaflet-providers/preview/
// The first one is the default (show only data). When you select other layers
// the choropleth will automagically get an opacity of 40%.
// the baseMaps is set in a try/catch so when Node reads the file independently it doesn't
// face plant on L is not defined.
var baseTilesURL = "http://tiles.mcmap.org/meckbase/{z}/{x}/{y}.png";
try {
    var baseMaps = {
      'Data': L.tileLayer(''),
      'Mecklenburg': L.tileLayer('http://tiles.mcmap.org/meckbase/{z}/{x}/{y}.png', {
        'attribution': 'Map data &copy; Mecklenburg County'
        }),
      'OpenStreetMap': L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
        'attribution': 'Map data &copy; OpenStreetMap contributors'
        }),
      'Earth':  L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        })
    };
}
catch(err) {}

// Some custom neighborhood selections
var customGeography = {
    'Jurisdiction*': {
        'Cornelius': [397, 398, 399, 404, 405, 409, 410, 411, 438, 448, 449, 458, 470, 471, 472, 474].map(String),
        'Huntersville': [397, 399, 412, 413, 416, 417, 418, 419, 420, 421, 422, 424, 434, 437, 445, 446, 447, 450, 452, 462, 463, 464, 466, 467].map(String),
        'Pineville': [116, 298, 300, 368, 430, 443, 444, 453].map(String),
        'Mint Hill': [144, 145, 220, 396, 403, 406, 407, 408, 423, 425, 428, 431, 435, 436, 442, 454, 455].map(String),
        'Matthews': [108, 118, 194, 287, 288, 335, 395, 400, 401, 402, 426, 432, 433, 456, 457, 459, 460, 465].map(String),
        'Davidson': [451, 468, 469, 473, 475].map(String),
        'Charlotte': [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 27, 28, 29, 30, 31, 32, 33, 34, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 226, 227, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 299, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 364, 365, 366, 367, 368, 369, 370, 371, 372, 373, 374, 375, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391, 392, 393, 394].map(String)
    },
    'City Council*': {
        '1': [2, 3, 9, 10, 11, 13, 18, 21, 22, 24, 37, 40, 86, 87, 90, 100, 126, 128, 138, 157, 163, 168, 184, 200, 223, 226, 249, 271, 312, 314, 315, 320, 327, 341, 342, 343, 344, 357, 363, 364, 366, 367, 369, 370, 371, 378, 381, 386, 389, 392].map(String),
        '2': [14, 33, 38, 49, 51, 70, 72, 85, 88, 109, 110, 112, 113, 117, 123, 125, 126, 136, 137, 139, 141, 150, 156, 157, 158, 182, 190, 191, 196, 207, 209, 211, 237, 259, 260, 264, 266, 274, 278, 279, 280, 281, 282, 283, 292, 295, 305, 311, 330, 332, 334, 337, 339, 340, 345, 346, 347, 348, 361, 363, 374, 376, 382, 384, 385].map(String),
        '3': [5, 6, 30, 34, 45, 51, 53, 54, 68, 71, 73, 76, 77, 78, 79, 81, 82, 84, 92, 93, 94, 95, 96, 97, 111, 114, 116, 119, 120, 121, 122, 124, 140, 159, 173, 174, 178, 190, 199, 203, 212, 230, 258, 267, 285, 286, 289, 290, 293, 294, 306, 307, 313, 317, 319, 321, 326, 333, 338, 339, 346, 347, 348, 361, 362, 387, 388].map(String),
        '4': [38, 46, 48, 60, 61, 62, 64, 65, 66, 67, 80, 100, 101, 103, 152, 153, 154, 155, 160, 192, 195, 218, 219, 221, 231, 232, 234, 238, 250, 251, 252, 254, 259, 265, 273, 275, 276, 277, 291, 296, 299, 301, 304, 324, 328, 329, 331, 334, 336, 371, 372, 377].map(String),
        '5': [16, 17, 27, 39, 50, 52, 57, 58, 59, 89, 91, 98, 99, 102, 107, 108, 127, 131, 134, 135, 144, 145, 146, 147, 162, 164, 165, 166, 167, 180, 183, 186, 197, 202, 220, 227, 229, 235, 240, 242, 243, 244, 245, 246, 247, 268, 312, 316, 322, 323, 324, 325, 360, 365, 390, 394].map(String),
        '6': [4, 7, 8, 11, 12, 15, 18, 19, 23, 28, 31, 36, 42, 43, 44, 47, 55, 69, 74, 105, 106, 129, 132, 133, 142, 143, 161, 177, 179, 185, 193, 198, 208, 210, 213, 215, 216, 217, 236, 241, 248, 270, 272, 287, 288, 297, 302, 303, 318, 349, 350, 358, 359, 373, 375, 383, 391, 392, 393].map(String),
        '7': [20, 25, 29, 32, 41, 56, 75, 115, 118, 148, 149, 151, 169, 170, 171, 172, 175, 176, 181, 187, 188, 189, 194, 201, 204, 205, 206, 222, 224, 233, 253, 255, 257, 261, 262, 263, 269, 284, 308, 309, 310, 335, 351, 352, 353, 354, 355, 356, 368, 379, 380, 400].map(String)
    },
    'County Commission*': {
        '1': [38, 72, 109, 110, 112, 136, 154, 156, 191, 195, 207, 209, 218, 231, 232, 250, 265, 266, 276, 277, 337, 345, 348, 372, 376, 397, 398, 399, 404, 405, 409, 410, 411, 412, 413, 416, 417, 418, 419, 420, 421, 422, 424, 434, 437, 438, 445, 446, 447, 448, 449, 450, 451, 452, 458, 462, 463, 464, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475].map(String),
        '2': [5, 6, 30, 34, 35, 45, 49, 51, 53, 54, 70, 71, 73, 77, 79, 82, 83, 84, 85, 88, 92, 93, 94, 95, 96, 111, 112, 113, 114, 116, 119, 120, 121, 122, 123, 124, 126, 130, 137, 139, 140, 141, 157, 158, 159, 173, 174, 178, 182, 190, 196, 199, 203, 211, 212, 230, 258, 260, 267, 285, 286, 290, 292, 293, 294, 295, 306, 307, 311, 313, 317, 319, 321, 326, 330, 332, 333, 338, 339, 345, 346, 347, 348, 361, 362, 363, 376, 382, 385, 387, 388].map(String),
        '3': [10, 14, 17, 21, 22, 33, 37, 39, 40, 46, 48, 60, 61, 62, 64, 65, 66, 67, 80, 100, 101, 102, 103, 117, 125, 126, 128, 138, 150, 152, 153, 155, 157, 160, 192, 195, 200, 219, 221, 223, 234, 237, 238, 244, 247, 249, 251, 252, 254, 259, 260, 264, 271, 273, 274, 275, 278, 279, 280, 281, 282, 283, 291, 296, 299, 301, 304, 305, 311, 312, 324, 325, 327, 328, 329, 331, 334, 336, 344, 363, 367, 369, 371, 374, 377, 386].map(String),
        '4': [2, 3, 9, 10, 16, 21, 22, 26, 27, 37, 48, 50, 51, 52, 57, 58, 59, 86, 87, 89, 90, 91, 98, 99, 107, 108, 127, 131, 134, 135, 144, 145, 146, 147, 157, 162, 163, 164, 165, 166, 167, 168, 180, 183, 184, 186, 197, 200, 202, 220, 225, 227, 228, 229, 240, 242, 243, 244, 245, 246, 248, 268, 270, 272, 287, 314, 315, 316, 322, 323, 325, 339, 340, 341, 342, 343, 344, 360, 361, 365, 366, 367, 369, 370, 378, 381, 382, 384, 386, 389, 390].map(String),
        '5': [4, 7, 8, 11, 12, 13, 15, 18, 19, 23, 24, 28, 31, 32, 36, 41, 42, 43, 44, 47, 55, 69, 74, 99, 105, 106, 118, 129, 132, 133, 142, 143, 161, 175, 177, 179, 181, 185, 193, 198, 201, 205, 206, 208, 210, 213, 215, 216, 217, 222, 224, 226, 233, 235, 236, 241, 261, 263, 269, 288, 297, 298, 302, 303, 318, 320, 349, 350, 351, 352, 353, 354, 357, 358, 359, 364, 367, 368, 373, 375, 383, 391, 392, 393, 394].map(String),
        '6': [20, 25, 29, 56, 68, 75, 76, 78, 81, 97, 108, 115, 116, 118, 144, 145, 148, 149, 151, 169, 170, 171, 172, 176, 181, 187, 188, 189, 194, 204, 220, 253, 255, 256, 257, 262, 284, 285, 287, 288, 289, 298, 300, 308, 309, 310, 335, 355, 356, 368, 379, 380, 395, 396, 400, 401, 402, 403, 406, 407, 408, 423, 425, 426, 428, 430, 431, 432, 433, 435, 436, 442, 443, 444, 453, 454, 455, 456, 457, 459, 460, 465].map(String)
    }
};

// Server-side processor for feedback.
// Post arguments passed to the server: email, url, agent (browser info), subject, to, message
var contactConfig = {
    "to": "tobin.bradley@gmail.com,qualityoflife@charlottenc.gov",
    "url": "/utilities/feedback.php"
};

// The min and max zoom for you map
// map default extent is the extent of your neighborhoods
var mapGeography = {
        minZoom: 9,
        maxZoom: 17
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


// The default way you want to carve up the data range/colors. This effects the colors on the map
// and the bar chart. Values are "jenks" or "quantize". Note that with "jenks" your bar
// chart x axis labels may collide if the breaks are too close to each other.
var quantileScale = "jenks";


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
//        "world_val"    [optional] override study area values for entire area via array
//                                 ex: "world_val": {"y_2013": 1234, "y_2015": 2345}
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
  "type": "weighted",
  "world_val": {"y_2014": 34.00}
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
  "type": "weighted",
  "world_val": {"y_2014": 56472}
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
 "m71": {
  "metric": "71",
  "category": "Environment",
  "suffix": "%",
  "raw_label": "Miles",
  "title": "Adopt-a-Street Participation",
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
 "m49": {
  "metric": "49",
  "category": "Environment",
  "suffix": "%",
  "raw_label": "Acres",
  "title": "Tree Canopy - Residential",
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
 "m46": {
  "metric": "46",
  "category": "Health",
  "suffix": "%",
  "raw_label": "Units",
  "title": "Proximity to a Pharmacy",
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
 "m68": {
  "metric": "68",
  "category": "Housing",
  "label": "Violations per 100 Units",
  "title": "Housing Code Violations",
  "type": "weighted",
  "raw_label": "Violations"
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
  "type": "weighted",
  "world_val": {"y_2014": 913}
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
  "label": "Units per 100 Acres",
  "raw_label": "Units",
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
  "label": "Units per 100 Acres",
  "raw_label": "Units",
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
 "m82": {
  "metric": "82",
  "category": "Housing",
  "suffix": "%",
  "raw_label": "Units",
  "title": "Subsidized Housing",
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
  "label": "Boardings per stop",
  "raw_label": "Weekly boardings",
  "title": "Transit Ridership",
  "type": "weighted"
 }
};


// we're going to export a few of our vars for the node build/watch process. Done in a try/catch
// so a browser reading this will barf quietly to itself.
try {
    exports.metricConfig = metricConfig;
    exports.customGeography = customGeography;
}
catch(err) {}
