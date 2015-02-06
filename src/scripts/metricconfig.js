// ***********************************************************
// Ye Olde Metric Configuration
//
// Here's the format:
// "m<the metric number>": {
        // "metric"        the metric number
        // "accuracy"      [optional] set true if metric has an accuracy file
        // "category"      the category of the metric
        // "label"         [optional] metric unit information
        // "title"         metric descriptive title
        // "decimals"      [optional] number of decimal places to display (default is 0)
        // "prefix"        [optional] prefix for the number, like '$'
        // "suffix"        [optional] suffix for the number, like '%'
        // "raw_label"     [optional] label for raw number if available (also makes raw number visible)
        // "type"          Type of calculation to be performed (and files to fetch). Options are sum, mean, and normalize.
// }
// ***********************************************************

var metricConfig = {
 "m2": {
  "metric": "2",
  "accuracy": "true",
  "category": "Character",
  "label": "Years",
  "title": "Age of Residents",
  "type": "normalize"
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
  "type": "normalize"
 },
 "m12": {
  "metric": "12",
  "accuracy": "true",
  "category": "Character",
  "suffix": "%",
  "title": "Population - Youth",
  "type": "normalize"
 },
 "m47": {
  "metric": "47",
  "category": "Character",
  "label": "People per Acre",
  "raw_label": "People",
  "title": "Population Density",
  "type": "normalize"
 },
 "m17": {
  "metric": "17",
  "category": "Character",
  "suffix": "%",
  "title": "Race/Ethnicity - All Other Races",
  "decimals": 1,
  "type": "normalize"
 },
 "m16": {
  "metric": "16",
  "category": "Character",
  "suffix": "%",
  "title": "Race/Ethnicity - Asian",
  "decimals": 1,
  "type": "normalize"
 },
 "m15": {
  "metric": "15",
  "category": "Character",
  "suffix": "%",
  "title": "Race/Ethnicity - Black or African American",
  "decimals": 1,
  "type": "normalize"
 },
 "m18": {
  "metric": "18",
  "category": "Character",
  "suffix": "%",
  "title": "Race/Ethnicity - Hispanic or Latino",
  "decimals": 1,
  "type": "normalize"
 },
 "m14": {
  "metric": "14",
  "category": "Character",
  "suffix": "%",
  "title": "Race/Ethnicity - White or Caucasian",
  "decimals": 1,
  "type": "normalize"
 },
 "m11": {
  "metric": "11",
  "category": "Character",
  "suffix": "%",
  "raw_label": "Acres",
  "title": "Vacant Land",
  "decimals": 1,
  "type": "normalize"
 },
 "m42": {
  "metric": "42",
  "category": "Economy",
  "label": "Years",
  "title": "Commercial Building Age",
  "type": "normalize"
 },
 "m19": {
  "metric": "19",
  "category": "Economy",
  "label": "Permits per 100 Acres",
  "raw_label": "Permits",
  "title": "Commercial Construction",
  "decimals": 1,
  "type": "normalize"
 },
 "m41": {
  "metric": "41",
  "category": "Economy",
  "label": "Average Square Feet",
  "raw_label": "Square Feet",
  "title": "Commercial Space",
  "type": "normalize"
 },
 "m38": {
  "metric": "38",
  "accuracy": "true",
  "category": "Economy",
  "suffix": "%",
  "title": "Employment",
  "type": "normalize"
 },
 "m80": {
  "metric": "80",
  "category": "Economy",
  "suffix": "%",
  "title": "Food and Nutrition Services",
  "type": "normalize"
 },
 "m37": {
  "metric": "37",
  "accuracy": "true",
  "category": "Economy",
  "prefix": "$",
  "title": "Household Income",
  "type": "normalize"
 },
 "m75": {
  "metric": "75",
  "category": "Economy",
  "label": "Jobs per Acre",
  "raw_label": "Jobs",
  "title": "Job Density",
  "decimals": 1,
  "type": "normalize"
 },
 "m79": {
  "metric": "79",
  "category": "Economy",
  "suffix": "%",
  "raw_label": "Units",
  "title": "Proximity to Financial Services",
  "type": "normalize"
 },
 "m20": {
  "metric": "20",
  "accuracy": "true",
  "category": "Education",
  "suffix": "%",
  "title": "Education Level - Bachelor's Degree",
  "type": "normalize"
 },
 "m39": {
  "metric": "39",
  "accuracy": "true",
  "category": "Education",
  "suffix": "%",
  "title": "Education Level - High School Diploma",
  "type": "normalize"
 },
 "m65": {
  "metric": "65",
  "category": "Education",
  "suffix": "%",
  "title": "High School Graduation Rate",
  "type": "normalize"
 },
 "m51": {
  "metric": "51",
  "category": "Education",
  "suffix": "%",
  "title": "Library Card Holders",
  "type": "normalize"
 },
 "m67": {
  "metric": "67",
  "category": "Education",
  "suffix": "%",
  "title": "Neighborhood School Attendance ",
  "type": "normalize"
 },
 "m21": {
  "metric": "21",
  "category": "Education",
  "suffix": "%",
  "raw_label": "Units",
  "title": "Proximity to Early Care and Education",
  "type": "normalize"
 },
 "m22": {
  "metric": "22",
  "category": "Education",
  "suffix": "%",
  "raw_label": "Units",
  "title": "Proximity to School-Age Care",
  "type": "normalize"
 },
 "m66": {
  "metric": "66",
  "category": "Education",
  "suffix": "%",
  "title": "Student Absenteeism",
  "type": "normalize"
 },
 "m62": {
  "metric": "62",
  "category": "Education",
  "suffix": "%",
  "title": "Test Proficiency - Elementary School",
  "decimals": 1,
  "type": "normalize"
 },
 "m64": {
  "metric": "64",
  "category": "Education",
  "suffix": "%",
  "title": "Test Proficiency - High School",
  "decimals": 1,
  "type": "normalize"
 },
 "m63": {
  "metric": "63",
  "category": "Education",
  "suffix": "%",
  "title": "Test Proficiency - Middle School",
  "decimals": 1,
  "type": "normalize"
 },
 "m52": {
  "metric": "52",
  "category": "Engagement",
  "label": "Calls per 100 People",
  "raw_label": "Calls",
  "title": "311 Requests",
  "decimals": 1,
  "type": "normalize"
 },
 "m50": {
  "metric": "50",
  "category": "Engagement",
  "suffix": "%",
  "raw_label": "Households",
  "title": "Arts and Culture Participation",
  "type": "normalize"
 },
 "m72": {
  "metric": "72",
  "category": "Engagement",
  "label": "Residents serving per 1,000 People",
  "raw_label": "People",
  "title": "Municipal Board/Committee Participation",
  "type": "normalize"
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
  "type": "normalize"
 },
 "m43": {
  "metric": "43",
  "category": "Environment",
  "suffix": "%",
  "raw_label": "Miles",
  "title": "Adopt-a-Stream Participation",
  "type": "normalize"
 },
 "m10": {
  "metric": "10",
  "accuracy": "true",
  "category": "Environment",
  "suffix": "%",
  "title": "Commuters Driving Alone",
  "raw_label": "",
  "type": "normalize"
 },
 "m26": {
  "metric": "26",
  "category": "Environment",
  "label": "Kilowatt hours per Month per unit",
  "raw_label": "Kilowatt hours per Month",
  "title": "Energy Consumption - Electricity",
  "type": "normalize"
 },
 "m77": {
  "metric": "77",
  "category": "Environment",
  "label": "Therms per Month per unit",
  "raw_label": "Therms per Month",
  "title": "Energy Consumption - Natural Gas",
  "type": "normalize"
 },
 "m4": {
  "metric": "4",
  "category": "Environment",
  "suffix": "%",
  "raw_label": "Acres",
  "title": "Impervious Surface",
  "decimals": 1,
  "type": "normalize"
 },
 "m23": {
  "metric": "23",
  "category": "Environment",
  "suffix": "%",
  "raw_label": "Units",
  "title": "Residential Recycling",
  "decimals": 1,
  "type": "normalize"
 },
 "m24": {
  "metric": "24",
  "category": "Environment",
  "label": "Pounds per Day per unit",
  "raw_label": "Pounds per Day",
  "title": "Residential Solid Waste",
  "decimals": 1,
  "type": "normalize"
 },
 "m25": {
  "metric": "25",
  "category": "Environment",
  "suffix": "%",
  "raw_label": "Tons",
  "title": "Residential Solid Waste Diversion",
  "decimals": 1,
  "type": "normalize"
 },
 "m3": {
  "metric": "3",
  "category": "Environment",
  "suffix": "%",
  "raw_label": "Acres",
  "title": "Tree Canopy",
  "decimals": 1,
  "type": "normalize"
 },
 "m27": {
  "metric": "27",
  "category": "Environment",
  "label": "Gallons per Day per unit",
  "raw_label": "Gallons per Day",
  "title": "Water Consumption",
  "type": "normalize"
 },
 "m57": {
  "metric": "57",
  "category": "Health",
  "label": "Years",
  "title": "Age of Death",
  "type": "normalize"
 },
 "m54": {
  "metric": "54",
  "category": "Health",
  "suffix": "%",
  "title": "Births to Adolescents",
  "decimals": 1,
  "type": "normalize"
 },
 "m55": {
  "metric": "55",
  "category": "Health",
  "suffix": "%",
  "title": "Low Birthweight",
  "decimals": 1,
  "type": "normalize"
 },
 "m56": {
  "metric": "56",
  "category": "Health",
  "suffix": "%",
  "title": "Prenatal Care",
  "decimals": 1,
  "type": "normalize"
 },
 "m28": {
  "metric": "28",
  "category": "Health",
  "suffix": "%",
  "raw_label": "Units",
  "title": "Proximity to Low-Cost Health Care",
  "type": "normalize"
 },
 "m74": {
  "metric": "74",
  "category": "Health",
  "suffix": "%",
  "raw_label": "Units",
  "title": "Proximity to Public Outdoor Recreation",
  "type": "normalize"
 },
 "m45": {
  "metric": "45",
  "category": "Health",
  "suffix": "%",
  "raw_label": "Units",
  "title": "Proximity to a Grocery Store",
  "type": "normalize"
 },
 "m81": {
  "metric": "81",
  "category": "Health",
  "suffix": "%",
  "title": "Public Health Insurance",
  "type": "normalize"
 },
 "m29": {
  "metric": "29",
  "accuracy": "true",
  "category": "Housing",
  "suffix": "%",
  "title": "Home Ownership",
  "type": "normalize"
 },
 "m76": {
  "metric": "76",
  "category": "Housing",
  "prefix": "$",
  "title": "Home Sales Price",
  "type": "normalize"
 },
 "m7": {
  "metric": "7",
  "category": "Housing",
  "label": "Years",
  "title": "Housing Age",
  "type": "normalize"
 },
 "m5": {
  "metric": "5",
  "category": "Housing",
  "label": "Units per Acre",
  "raw_label": "Units",
  "title": "Housing Density",
  "decimals": 1,
  "type": "normalize"
 },
 "m6": {
  "metric": "6",
  "category": "Housing",
  "label": "Average Sqft",
  "title": "Housing Size",
  "type": "normalize"
 },
 "m40": {
  "metric": "40",
  "accuracy": "true",
  "category": "Housing",
  "prefix": "$",
  "title": "Rental Costs",
  "type": "normalize"
 },
 "m53": {
  "metric": "53",
  "category": "Housing",
  "suffix": "%",
  "raw_label": "Units",
  "title": "Rental Houses",
  "type": "normalize"
 },
 "m69": {
  "metric": "69",
  "category": "Housing",
  "suffix": "%",
  "raw_label": "Units",
  "title": "Residential Foreclosures",
  "decimals": 1,
  "type": "normalize"
 },
 "m8": {
  "metric": "8",
  "category": "Housing",
  "label": "Permits per 100 Acres",
  "raw_label": "Permits",
  "title": "Residential New Construction",
  "decimals": 1,
  "type": "normalize"
 },
 "m31": {
  "metric": "31",
  "accuracy": "true",
  "category": "Housing",
  "suffix": "%",
  "title": "Residential Occupancy",
  "type": "normalize"
 },
 "m9": {
  "metric": "9",
  "category": "Housing",
  "label": "Permits per 100 Acres",
  "raw_label": "Permits",
  "title": "Residential Renovation",
  "decimals": 1,
  "type": "normalize"
 },
 "m30": {
  "metric": "30",
  "category": "Housing",
  "suffix": "%",
  "raw_label": "Units",
  "title": "Single-Family Housing",
  "type": "normalize"
 },
 "m61": {
  "metric": "61",
  "category": "Safety",
  "label": "Calls per 1,000 People",
  "raw_label": "Calls",
  "title": "Calls for Animal Control",
  "decimals": 1,
  "type": "normalize"
 },
 "m59": {
  "metric": "59",
  "category": "Safety",
  "label": "Crimes per 1,000 People",
  "raw_label": "Crimes",
  "title": "Crime - Property",
  "decimals": 1,
  "type": "normalize"
 },
 "m58": {
  "metric": "58",
  "category": "Safety",
  "label": "Crimes per 1,000 People",
  "raw_label": "Crimes",
  "title": "Crime - Violent",
  "decimals": 1,
  "type": "normalize"
 },
 "m60": {
  "metric": "60",
  "category": "Safety",
  "label": "Calls per 1,000 People",
  "raw_label": "Calls",
  "title": "Disorder-related Calls",
  "decimals": 1,
  "type": "normalize"
 },
 "m78": {
  "metric": "78",
  "category": "Safety",
  "label": "Calls per 1,000 People",
  "raw_label": "Calls",
  "title": "Fire Calls for Service",
  "decimals": 1,
  "type": "normalize"
 },
 "m32": {
  "metric": "32",
  "category": "Safety",
  "label": "Violations per 100 Units",
  "raw_label": "Violations",
  "title": "Nuisance Violations",
  "decimals": 1,
  "type": "normalize"
 },
 "m34": {
  "metric": "34",
  "category": "Transportation",
  "label": "Index Value (1-3)",
  "raw_label": "Index Value (1-3)",
  "title": "Bicycle Friendliness",
  "decimals": 1,
  "type": "normalize"
 },
 "m33": {
  "metric": "33",
  "accuracy": "true",
  "category": "Transportation",
  "suffix": "%",
  "title": "Long Commute",
  "type": "normalize"
 },
 "m36": {
  "metric": "36",
  "category": "Transportation",
  "suffix": "%",
  "raw_label": "Units",
  "title": "Proximity to Public Transportation",
  "type": "normalize"
 },
 "m70": {
  "metric": "70",
  "category": "Transportation",
  "suffix": "%",
  "raw_label": "Miles",
  "title": "Sidewalk Availability",
  "decimals": 1,
  "type": "normalize"
 },
 "m35": {
  "metric": "35",
  "category": "Transportation",
  "label": "Index Value (1-3)",
  "title": "Street Connectivity",
  "decimals": 2,
  "type": "normalize"
 },
 "m44": {
  "metric": "44",
  "category": "Transportation",
  "label": "Boardings per Available Route",
  "raw_label": "Average Weekly Boardings",
  "title": "Transit Ridership",
  "type": "normalize"
 }
};
