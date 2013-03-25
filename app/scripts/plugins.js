// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,timeStamp,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();){b[a]=b[a]||c}})((function(){try
{console.log();return window.console;}catch(err){return window.console={};}})());


// get url parameters
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}


// Prototypes and helpers
function prettyMetric(x, metric) {
    if (isNumber(x)) {
        if (x >=10000) x = x.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",");
        return (FTmeta[metric].style.prefix ? FTmeta[activeMeasure].style.prefix : "") + x + (FTmeta[metric].style.units ? FTmeta[activeMeasure].style.units : "");
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
        FTmeta[measure].style.avg = Math.round((theSum / theCount) * 100) / 100;
    }
}

/* Array.prototype.indexOf for IE (issue #26) */
if(!Array.prototype.indexOf){Array.prototype.indexOf=function(b){var a=this.length,c=Number(arguments[1])||0;c=c<0?Math.ceil(c):Math.floor(c);if(c<0){c+=a}for(;c<a;c++){if(c in this&&this[c]===b){return c}}return -1}};








