/**
 * Big long comment
 */

var map, marker, layer, geocoder; // Variables to support the map
var activeRecord = {}; // Holder for data in selected record
var countyAverage = {}; // Holder for county averages
var tableID = 1844838;  // ID of the fusion table layer
var wsbase = "http://maps.co.mecklenburg.nc.us/rest/";   // Base URL for REST web services

/**
 * Map Configuration Elements
 */
var mapCenterZoom = { lat: 35.260, lng: -80.817, zoom: 10 };


/**
 * Data Configuration
 * ID, class, title, description, importance, tech_notes, source, links, style
 */

var FTmeta = {
	character_1 : {
		field: "character_1",
		category: "character",
		title: "Metric 1",
		description: "Big long description here.",
		importance: "Notes on importance.",
		tech_notes: "Technical notes for the geeks.",
		source: "Information on the data source.",
		links: '<a href="javascript:void(0)">Link 1</a>, <a href="javascript:void(0)">Link 2</a>, <a href="javascript:void(0)">Link 3</a>',
		style: { 'min': 0, 'max': 100, 'colors': [ '#e0ffd4', '#a5ef63', '#50aa00',  '#1f5b10' ] }
	},
	character_2 : {
		field: "character_2",
		category: "character",
		title: "Metric 2",
		description: "Big long description here.",
		importance: "Notes on importance.",
		tech_notes: "Technical notes for the geeks.",
		source: "Information on the data source.",
		links: '<a href="javascript:void(0)">Link 1</a>, <a href="javascript:void(0)">Link 2</a>, <a href="javascript:void(0)">Link 3</a>',
		style: { 'min': 0, 'max': 50, 'colors': [ '#e0ffd4', '#a5ef63', '#1f5b10' ] }
	},
    character_3 : {
		field: "character_3",
		category: "character",
		title: "Metric 3",
		description: "Big long description here.",
		importance: "Notes on importance.",
		tech_notes: "Technical notes for the geeks.",
		source: "Information on the data source.",
		links: '<a href="javascript:void(0)">Link 1</a>, <a href="javascript:void(0)">Link 2</a>, <a href="javascript:void(0)">Link 3</a>',
		style: { 'min': 0, 'max': 50, 'colors': [ '#e0ffd4', '#a5ef63', '#1f5b10' ] }
	},
    engagement_1 : {
		field: "engagement_1",
		category: "engagement",
		title: "Metric 1",
		description: "Big long description here.",
		importance: "Notes on importance.",
		tech_notes: "Technical notes for the geeks.",
		source: "Information on the data source.",
		links: '<a href="javascript:void(0)">Link 1</a>, <a href="javascript:void(0)">Link 2</a>, <a href="javascript:void(0)">Link 3</a>',
		style: { 'min': 0, 'max': 100, 'colors': [ '#e0ffd4', '#a5ef63', '#50aa00',  '#1f5b10' ] }
	},
    engagement_2 : {
		field: "engagement_2",
		category: "engagement",
		title: "Metric 2",
		description: "Big long description here.",
		importance: "Notes on importance.",
		tech_notes: "Technical notes for the geeks.",
		source: "Information on the data source.",
		links: '<a href="javascript:void(0)">Link 1</a>, <a href="javascript:void(0)">Link 2</a>, <a href="javascript:void(0)">Link 3</a>',
		style: { 'min': 0, 'max': 100, 'colors': [ '#e0ffd4', '#a5ef63', '#50aa00',  '#1f5b10' ] }
	},
    engagement_3 : {
		field: "engagement_3",
		category: "engagement",
		title: "Metric 3",
		description: "Big long description here.",
		importance: "Notes on importance.",
		tech_notes: "Technical notes for the geeks.",
		source: "Information on the data source.",
		links: '<a href="javascript:void(0)">Link 1</a>, <a href="javascript:void(0)">Link 2</a>, <a href="javascript:void(0)">Link 3</a>',
		style: { 'min': 0, 'max': 100, 'colors': [ '#e0ffd4', '#a5ef63', '#50aa00',  '#1f5b10' ] }
	},
    green_1 : {
		field: "green_1",
		category: "green",
		title: "Metric 1",
		description: "Big long description here.",
		importance: "Notes on importance.",
		tech_notes: "Technical notes for the geeks.",
		source: "Information on the data source.",
		links: '<a href="javascript:void(0)">Link 1</a>, <a href="javascript:void(0)">Link 2</a>, <a href="javascript:void(0)">Link 3</a>',
		style: { 'min': 0, 'max': 100, 'colors': [ '#e0ffd4', '#a5ef63', '#50aa00',  '#1f5b10' ] }
	},
    green_2 : {
		field: "green_2",
		category: "green",
		title: "Metric 2",
		description: "Big long description here.",
		importance: "Notes on importance.",
		tech_notes: "Technical notes for the geeks.",
		source: "Information on the data source.",
		links: '<a href="javascript:void(0)">Link 1</a>, <a href="javascript:void(0)">Link 2</a>, <a href="javascript:void(0)">Link 3</a>',
		style: { 'min': 0, 'max': 100, 'colors': [ '#e0ffd4', '#a5ef63', '#50aa00',  '#1f5b10' ] }
	},
    green_3 : {
		field: "green_3",
		category: "green",
		title: "Metric 3",
		description: "Big long description here.",
		importance: "Notes on importance.",
		tech_notes: "Technical notes for the geeks.",
		source: "Information on the data source.",
		links: '<a href="javascript:void(0)">Link 1</a>, <a href="javascript:void(0)">Link 2</a>, <a href="javascript:void(0)">Link 3</a>',
		style: { 'min': 0, 'max': 100, 'colors': [ '#e0ffd4', '#a5ef63', '#50aa00',  '#1f5b10' ] }
	},
    health_1 : {
		field: "health_1",
		category: "health",
		title: "Metric 1",
		description: "Big long description here.",
		importance: "Notes on importance.",
		tech_notes: "Technical notes for the geeks.",
		source: "Information on the data source.",
		links: '<a href="javascript:void(0)">Link 1</a>, <a href="javascript:void(0)">Link 2</a>, <a href="javascript:void(0)">Link 3</a>',
		style: { 'min': 0, 'max': 100, 'colors': [ '#e0ffd4', '#a5ef63', '#50aa00',  '#1f5b10' ] }
	},
    health_2 : {
		field: "health_2",
		category: "health",
		title: "Metric 2",
		description: "Big long description here.",
		importance: "Notes on importance.",
		tech_notes: "Technical notes for the geeks.",
		source: "Information on the data source.",
		links: '<a href="javascript:void(0)">Link 1</a>, <a href="javascript:void(0)">Link 2</a>, <a href="javascript:void(0)">Link 3</a>',
		style: { 'min': 0, 'max': 100, 'colors': [ '#e0ffd4', '#a5ef63', '#50aa00',  '#1f5b10' ] }
	},
    health_3 : {
		field: "health_3",
		category: "health",
		title: "Metric 3",
		description: "Big long description here.",
		importance: "Notes on importance.",
		tech_notes: "Technical notes for the geeks.",
		source: "Information on the data source.",
		links: '<a href="javascript:void(0)">Link 1</a>, <a href="javascript:void(0)">Link 2</a>, <a href="javascript:void(0)">Link 3</a>',
		style: { 'min': 0, 'max': 100, 'colors': [ '#e0ffd4', '#a5ef63', '#50aa00',  '#1f5b10' ] }
	},
    education_1 : {
		field: "education_1",
		category: "education",
		title: "Metric 1",
		description: "Big long description here.",
		importance: "Notes on importance.",
		tech_notes: "Technical notes for the geeks.",
		source: "Information on the data source.",
		links: '<a href="javascript:void(0)">Link 1</a>, <a href="javascript:void(0)">Link 2</a>, <a href="javascript:void(0)">Link 3</a>',
		style: { 'min': 0, 'max': 100, 'colors': [ '#e0ffd4', '#a5ef63', '#50aa00',  '#1f5b10' ] }
	},
    education_2 : {
		field: "education_2",
		category: "education",
		title: "Metric 2",
		description: "Big long description here.",
		importance: "Notes on importance.",
		tech_notes: "Technical notes for the geeks.",
		source: "Information on the data source.",
		links: '<a href="javascript:void(0)">Link 1</a>, <a href="javascript:void(0)">Link 2</a>, <a href="javascript:void(0)">Link 3</a>',
		style: { 'min': 0, 'max': 100, 'colors': [ '#e0ffd4', '#a5ef63', '#50aa00',  '#1f5b10' ] }
	},
    education_3 : {
		field: "education_3",
		category: "education",
		title: "Metric 3",
		description: "Big long description here.",
		importance: "Notes on importance.",
		tech_notes: "Technical notes for the geeks.",
		source: "Information on the data source.",
		links: '<a href="javascript:void(0)">Link 1</a>, <a href="javascript:void(0)">Link 2</a>, <a href="javascript:void(0)">Link 3</a>',
		style: { 'min': 0, 'max': 100, 'colors': [ '#e0ffd4', '#a5ef63', '#50aa00',  '#1f5b10' ] }
	},
    safety_1 : {
		field: "safety_1",
		category: "safety",
		title: "Metric 1",
		description: "Big long description here.",
		importance: "Notes on importance.",
		tech_notes: "Technical notes for the geeks.",
		source: "Information on the data source.",
		links: '<a href="javascript:void(0)">Link 1</a>, <a href="javascript:void(0)">Link 2</a>, <a href="javascript:void(0)">Link 3</a>',
		style: { 'min': 0, 'max': 100, 'colors': [ '#e0ffd4', '#a5ef63', '#50aa00',  '#1f5b10' ] }
	},
    safety_2 : {
		field: "safety_2",
		category: "safety",
		title: "Metric 2",
		description: "Big long description here.",
		importance: "Notes on importance.",
		tech_notes: "Technical notes for the geeks.",
		source: "Information on the data source.",
		links: '<a href="javascript:void(0)">Link 1</a>, <a href="javascript:void(0)">Link 2</a>, <a href="javascript:void(0)">Link 3</a>',
		style: { 'min': 0, 'max': 100, 'colors': [ '#e0ffd4', '#a5ef63', '#50aa00',  '#1f5b10' ] }
	},
    safety_3 : {
		field: "safety_3",
		category: "safety",
		title: "Metric 3",
		description: "Big long description here.",
		importance: "Notes on importance.",
		tech_notes: "Technical notes for the geeks.",
		source: "Information on the data source.",
		links: '<a href="javascript:void(0)">Link 1</a>, <a href="javascript:void(0)">Link 2</a>, <a href="javascript:void(0)">Link 3</a>',
		style: { 'min': 0, 'max': 100, 'colors': [ '#e0ffd4', '#a5ef63', '#50aa00',  '#1f5b10' ] }
	},
    housing_1 : {
		field: "housing_1",
		category: "housing",
		title: "Metric 1",
		description: "Big long description here.",
		importance: "Notes on importance.",
		tech_notes: "Technical notes for the geeks.",
		source: "Information on the data source.",
		links: '<a href="javascript:void(0)">Link 1</a>, <a href="javascript:void(0)">Link 2</a>, <a href="javascript:void(0)">Link 3</a>',
		style: { 'min': 0, 'max': 100, 'colors': [ '#e0ffd4', '#a5ef63', '#50aa00',  '#1f5b10' ] }
	},
    housing_2 : {
		field: "housing_2",
		category: "housing",
		title: "Metric 2",
		description: "Big long description here.",
		importance: "Notes on importance.",
		tech_notes: "Technical notes for the geeks.",
		source: "Information on the data source.",
		links: '<a href="javascript:void(0)">Link 1</a>, <a href="javascript:void(0)">Link 2</a>, <a href="javascript:void(0)">Link 3</a>',
		style: { 'min': 0, 'max': 100, 'colors': [ '#e0ffd4', '#a5ef63', '#50aa00',  '#1f5b10' ] }
	},
    housing_3 : {
		field: "housing_3",
		category: "housing",
		title: "Metric 3",
		description: "Big long description here.",
		importance: "Notes on importance.",
		tech_notes: "Technical notes for the geeks.",
		source: "Information on the data source.",
		links: '<a href="javascript:void(0)">Link 1</a>, <a href="javascript:void(0)">Link 2</a>, <a href="javascript:void(0)">Link 3</a>',
		style: { 'min': 0, 'max': 100, 'colors': [ '#e0ffd4', '#a5ef63', '#50aa00',  '#1f5b10' ] }
	},
    economics_1 : {
		field: "economics_1",
		category: "economics",
		title: "Metric 1",
		description: "Big long description here.",
		importance: "Notes on importance.",
		tech_notes: "Technical notes for the geeks.",
		source: "Information on the data source.",
		links: '<a href="javascript:void(0)">Link 1</a>, <a href="javascript:void(0)">Link 2</a>, <a href="javascript:void(0)">Link 3</a>',
		style: { 'min': 0, 'max': 100, 'colors': [ '#e0ffd4', '#a5ef63', '#50aa00',  '#1f5b10' ] }
	},
    economics_2 : {
		field: "economics_2",
		category: "economics",
		title: "Metric 2",
		description: "Big long description here.",
		importance: "Notes on importance.",
		tech_notes: "Technical notes for the geeks.",
		source: "Information on the data source.",
		links: '<a href="javascript:void(0)">Link 1</a>, <a href="javascript:void(0)">Link 2</a>, <a href="javascript:void(0)">Link 3</a>',
		style: { 'min': 0, 'max': 100, 'colors': [ '#e0ffd4', '#a5ef63', '#50aa00',  '#1f5b10' ] }
	},
    economics_3 : {
		field: "economics_3",
		category: "economics",
		title: "Metric 3",
		description: "Big long description here.",
		importance: "Notes on importance.",
		tech_notes: "Technical notes for the geeks.",
		source: "Information on the data source.",
		links: '<a href="javascript:void(0)">Link 1</a>, <a href="javascript:void(0)">Link 2</a>, <a href="javascript:void(0)">Link 3</a>',
		style: { 'min': 0, 'max': 100, 'colors': [ '#e0ffd4', '#a5ef63', '#50aa00',  '#1f5b10' ] }
	}
};