
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
function asc_sort(a, b){
    return ($(b).text()) < ($(a).text());
}


/*
    Prototypes and helpers
*/
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
        FTmeta[measure].style.avg = Math.round(theSum / theCount);
    }
}
// Function to change any text to Proper Case (e.g. picco -> Picco)
String.prototype.toProperCase = function()
{
    return this.charAt(0).toUpperCase() + this.substring(1,this.length).toLowerCase();
}


/*! http://mths.be/placeholder v2.0.7 by @mathias */
;(function(f,h,$){var a='placeholder' in h.createElement('input'),d='placeholder' in h.createElement('textarea'),i=$.fn,c=$.valHooks,k,j;if(a&&d){j=i.placeholder=function(){return this};j.input=j.textarea=true}else{j=i.placeholder=function(){var l=this;l.filter((a?'textarea':':input')+'[placeholder]').not('.placeholder').bind({'focus.placeholder':b,'blur.placeholder':e}).data('placeholder-enabled',true).trigger('blur.placeholder');return l};j.input=a;j.textarea=d;k={get:function(m){var l=$(m);return l.data('placeholder-enabled')&&l.hasClass('placeholder')?'':m.value},set:function(m,n){var l=$(m);if(!l.data('placeholder-enabled')){return m.value=n}if(n==''){m.value=n;if(m!=h.activeElement){e.call(m)}}else{if(l.hasClass('placeholder')){b.call(m,true,n)||(m.value=n)}else{m.value=n}}return l}};a||(c.input=k);d||(c.textarea=k);$(function(){$(h).delegate('form','submit.placeholder',function(){var l=$('.placeholder',this).each(b);setTimeout(function(){l.each(e)},10)})});$(f).bind('beforeunload.placeholder',function(){$('.placeholder').each(function(){this.value=''})})}function g(m){var l={},n=/^jQuery\d+$/;$.each(m.attributes,function(p,o){if(o.specified&&!n.test(o.name)){l[o.name]=o.value}});return l}function b(m,n){var l=this,o=$(l);if(l.value==o.attr('placeholder')&&o.hasClass('placeholder')){if(o.data('placeholder-password')){o=o.hide().next().show().attr('id',o.removeAttr('id').data('placeholder-id'));if(m===true){return o[0].value=n}o.focus()}else{l.value='';o.removeClass('placeholder');l==h.activeElement&&l.select()}}}function e(){var q,l=this,p=$(l),m=p,o=this.id;if(l.value==''){if(l.type=='password'){if(!p.data('placeholder-textinput')){try{q=p.clone().attr({type:'text'})}catch(n){q=$('<input>').attr($.extend(g(this),{type:'text'}))}q.removeAttr('name').data({'placeholder-password':true,'placeholder-id':o}).bind('focus.placeholder',b);p.data({'placeholder-textinput':q,'placeholder-id':o}).before(q)}p=p.removeAttr('id').hide().prev().attr('id',o).show()}p.addClass('placeholder');p[0].value=p.attr('placeholder')}else{p.removeClass('placeholder')}}}(this,document,jQuery));
