
// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  if(this.console) {
    arguments.callee = arguments.callee.caller;
    var newarr = [].slice.call(arguments);
    (typeof console.log === 'object' ? log.apply.call(console.log, console, newarr) : console.log.apply(console, newarr));
  }
};

// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,timeStamp,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();){b[a]=b[a]||c}})((function(){try
{console.log();return window.console;}catch(err){return window.console={};}})());


// place any jQuery/helper plugins in here, instead of separate, slower script files.

/**
 * Takes a string a URL encodes or decodes it
 * @param {string} str
 */
function urlencode(str) {
	str = escape(str);
	str = str.replace('+', '%2B');
	str = str.replace('%20', '+');
	str = str.replace('*', '%2A');
	str = str.replace('/', '%2F');
	str = str.replace('@', '%40');
	return str;
}
function urldecode(str) {
	str = str.replace('+', ' ');
	str = unescape(str);
	return str;
}

/**
 * Read a page's GET URL variables and return them as an associative array.
 */
function getUrlVars() {
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for(var i = 0; i < hashes.length; i++) {
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	return vars;
}

/**
 * Capitalize first letter of word
 */
function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Get array of fields from metrics.json
 */
function getFieldsArray(data) {
    theFields = new Array();
    i = 0;
    $.each(data, function(key, value) {
        theFields[i] = value.field;
        i++;
    });
    return theFields;
}

/**
 * Get array of fields from metrics.json with average
 */
function getFieldsAverageArray(data) {
    theFields = new Array();
    i = 0;
    $.each(data, function(key, value) {
        theFields[i] = "AVERAGE(" + value.field  + ") as " + value.field;
        i++;
    });
    return theFields;
}

/**
 * Sort option list
 */
function sortAlpha(a, b) {          
    return a.innerHTML.toLowerCase() > b.innerHTML.toLowerCase() ? 1 : -1;
};

/**
 * Random color generator for charts
 */
function randomHexColor() {
    return Math.floor(Math.random()*16777215).toString(16);
}
