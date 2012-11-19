
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
* Add left and right labels to a jQuery UI Slider
*/
$.fn.extend({
    sliderLabels: function(left,right) {
        var $this = $(this);
        var $sliderdiv= $this;
        $sliderdiv
        .css({'font-weight': 'normal'});
        $sliderdiv
        .prepend('<span class="ui-slider-inner-label"  style="position: absolute; left:0px; top:15px; font-size: 12px; ">'+left+ '</span>')
        .append('<span class="ui-slider-inner-label" style="position: absolute; right:0px; top:15px; font-size: 12px;">'+right+ '</span>');
    }
});

/**
 * Capitalize first letter of word
 */
function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


/**
 * Sort option list
 */
function sortAlpha(a, b) {
    return a.innerHTML.toLowerCase() > b.innerHTML.toLowerCase() ? 1 : -1;
}


/*
    Prototypes and helpers
*/
function prettyMetric(x, metric) {
    if (isNumber(x)) {
        return (FTmeta[metric].style.prefix ? FTmeta[activeMeasure].style.prefix : "") + x.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + FTmeta[metric].style.units;
    }
    else {
        return "N/A";
    }
}
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
function calcAverage(measure) {
    if (!FTmeta[activeMeasure].style.avg) {
        var theSum = 0;
        var theCount = 0;
        $.each(jsonData.features, function() {
            theSum = theSum + this.properties[measure];
            if (this.properties[measure] !== null) theCount++;
        });
        FTmeta[measure].style.avg = Math.round(theSum / theCount);
    }
}
