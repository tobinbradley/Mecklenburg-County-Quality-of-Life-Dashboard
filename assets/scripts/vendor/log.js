/*!
 * log.js
 *
 * Author: Michael Zelensky http://miha.in
 *
 * Summary: cross-browser wrapper for Console methods
 * License: MIT
 * Version: 1.0
 *
 */


var log = {};

/* IE9 no console hack */

if (typeof console === 'undefined') {
	window.console = {
		log     : function(){},
		debug   : function(){},
		info    : function(){},
		warn    : function(){},
		error   : function(){}
	}
}

/* IE9 console.log.apply fix */

//init state - no console
log.xlog     = function(){},
log.xdebug   = function(){},
log.xinfo    = function(){},
log.xwarn    = function(){},
log.xerror   = function(){};

// with console
if (console) {

	//modern browsers
	if (console.log.apply) {
		log.xlog    = function() { console.log.apply(console, arguments); };
		log.xdebug  = function() { console.debug.apply(console, arguments); };
		log.xinfo   = function() { console.info.apply(console, arguments); };
		log.xwarn   = function() { console.warn.apply(console, arguments); };
		log.xerror  = function() { console.error.apply(console, arguments); };

	//ie9
	} else {
		log.xlog    = Function.prototype.bind.call(console.log, console);
		log.xdebug  = function() {console.log('Error: console.debug is not supported by the browser')};
		log.xinfo   = Function.prototype.bind.call(console.info, console);
		log.xwarn   = Function.prototype.bind.call(console.warn, console);
		log.xerror  = Function.prototype.bind.call(console.error, console);
	}
	
	// console.time implementation for IE
	if (typeof(window.console.time) == "undefined") {
		console.time = function(name, reset){
			if(!name) { return; }
			var time = new Date().getTime();
			if(!console.timeCounters) { console.timeCounters = {}; }
			var key = "KEY" + name.toString();
			if(!reset && console.timeCounters[key]) { return; }
				console.timeCounters[key] = time;
			};

		console.timeEnd = function(name){
			var time = new Date().getTime();
			if(!console.timeCounters) { return; }
			var key = "KEY" + name.toString();
			var timeCounter = console.timeCounters[key];
			var diff;
			if(timeCounter) {
				diff = time - timeCounter;
				var label = name + ": " + diff + "ms";
				console.info(label);
				delete console.timeCounters[key];
			}
			return diff;
		};
	}
}


log.log = function () {
    log.xlog.apply(console, arguments);
};

log.debug = function () {
    log.xdebug.apply(console, arguments);
};

log.info = function () {
    log.xinfo.apply(console, arguments);
};

log.warn = function () {
    log.xwarn.apply(console, arguments);
};


log.error = function () {
    log.xerror.apply(console, arguments);
};


log.time = function (label) {
	if (console && console.time) {
		console.time(label);
	}
};


log.timeEnd = function (label) {
	if (console && console.timeEnd) {
		console.timeEnd(label);
	}
};


log.group = function (label) {
	if (console && console.group) {
		console.group(label);
	}
};

log.groupEnd = function (label) {
	if (console && console.groupEnd) {
		console.groupEnd(label);
	}
};