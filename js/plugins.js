
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

/**
 * Fix placeholder support for IE and whatnot
 */
jQuery.support.placeholder = (function(){
    var i = document.createElement('input');
    return 'placeholder' in i;
})();
if (!$.support.placeholder) {
    $('[placeholder]').focus(function() {
      var input = $(this);
      if (input.val() == input.attr('placeholder')) {
        input.val('');
        input.removeClass('placeholder');
      }
    }).blur(function() {
      var input = $(this);
      if (input.val() == '' || input.val() == input.attr('placeholder')) {
        input.addClass('placeholder');
        input.val(input.attr('placeholder'));
      }
    }).blur();
}

/**
 * Shuffle the DOM
 */
(function($){
    $.fn.shuffle = function() {
        var allElems = this.get(),
            getRandom = function(max) {
                return Math.floor(Math.random() * max);
            },
            shuffled = $.map(allElems, function(){
                var random = getRandom(allElems.length),
                    randEl = $(allElems[random]).clone(true)[0];
                allElems.splice(random, 1);
                return randEl;
           });
        this.each(function(i){
            $(this).replaceWith($(shuffled[i]));
        });
        return $(shuffled);
    };
})(jQuery);


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



/*
 * jQuery hashchange event - v1.3 - 7/21/2010
 * http://benalman.com/projects/jquery-hashchange-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($,e,b){var c="hashchange",h=document,f,g=$.event.special,i=h.documentMode,d="on"+c in e&&(i===b||i>7);function a(j){j=j||location.href;return"#"+j.replace(/^[^#]*#?(.*)$/,"$1")}$.fn[c]=function(j){return j?this.bind(c,j):this.trigger(c)};$.fn[c].delay=50;g[c]=$.extend(g[c],{setup:function(){if(d){return false}$(f.start)},teardown:function(){if(d){return false}$(f.stop)}});f=(function(){var j={},p,m=a(),k=function(q){return q},l=k,o=k;j.start=function(){p||n()};j.stop=function(){p&&clearTimeout(p);p=b};function n(){var r=a(),q=o(m);if(r!==m){l(m=r,q);$(e).trigger(c)}else{if(q!==m){location.href=location.href.replace(/#.*/,"")+q}}p=setTimeout(n,$.fn[c].delay)}$.browser.msie&&!d&&(function(){var q,r;j.start=function(){if(!q){r=$.fn[c].src;r=r&&r+a();q=$('<iframe tabindex="-1" title="empty"/>').hide().one("load",function(){r||l(a());n()}).attr("src",r||"javascript:0").insertAfter("body")[0].contentWindow;h.onpropertychange=function(){try{if(event.propertyName==="title"){q.document.title=h.title}}catch(s){}}}};j.stop=k;o=function(){return a(q.location.href)};l=function(v,s){var u=q.document,t=$.fn[c].domain;if(v!==s){u.title=h.title;u.open();t&&u.write('<script>document.domain="'+t+'"<\/script>');u.close();q.location.hash=v}}})();return j})()})(jQuery,this);
 


/*
 * jQuery MultiSelect UI Widget 1.12
 * Copyright (c) 2011 Eric Hynds
 *
 * http://www.erichynds.com/jquery/jquery-ui-multiselect-widget/
 *
 * Depends:
 *   - jQuery 1.4.2+
 *   - jQuery UI 1.8 widget factory
 *
 * Optional:
 *   - jQuery UI effects
 *   - jQuery UI position utility
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 */
(function(d){var j=0;d.widget("ech.multiselect",{options:{header:!0,height:175,minWidth:225,classes:"",checkAllText:"Check all",uncheckAllText:"Uncheck all",noneSelectedText:"Select options",selectedText:"# selected",selectedList:0,show:"",hide:"",autoOpen:!1,multiple:!0,position:{}},_create:function(){var a=this.element.hide(),b=this.options;this.speed=d.fx.speeds._default;this._isOpen=!1;a=(this.button=d('<button type="button"><span class="ui-icon ui-icon-triangle-2-n-s"></span></button>')).addClass("ui-multiselect ui-widget ui-state-default ui-corner-all").addClass(b.classes).attr({title:a.attr("title"), "aria-haspopup":!0,tabIndex:a.attr("tabIndex")}).insertAfter(a);(this.buttonlabel=d("<span />")).html(b.noneSelectedText).appendTo(a);var a=(this.menu=d("<div />")).addClass("ui-multiselect-menu ui-widget ui-widget-content ui-corner-all").addClass(b.classes).appendTo(document.body),c=(this.header=d("<div />")).addClass("ui-widget-header ui-corner-all ui-multiselect-header ui-helper-clearfix").appendTo(a);(this.headerLinkContainer=d("<ul />")).addClass("ui-helper-reset").html(function(){return!0=== b.header?'<li><a class="ui-multiselect-all" href="#"><span class="ui-icon ui-icon-check"></span><span>'+b.checkAllText+'</span></a></li><li><a class="ui-multiselect-none" href="#"><span class="ui-icon ui-icon-closethick"></span><span>'+b.uncheckAllText+"</span></a></li>":"string"===typeof b.header?"<li>"+b.header+"</li>":""}).append('<li class="ui-multiselect-close"><a href="#" class="ui-multiselect-close"><span class="ui-icon ui-icon-circle-close"></span></a></li>').appendTo(c);(this.checkboxContainer= d("<ul />")).addClass("ui-multiselect-checkboxes ui-helper-reset").appendTo(a);this._bindEvents();this.refresh(!0);b.multiple||a.addClass("ui-multiselect-single")},_init:function(){!1===this.options.header&&this.header.hide();this.options.multiple||this.headerLinkContainer.find(".ui-multiselect-all, .ui-multiselect-none").hide();this.options.autoOpen&&this.open();this.element.is(":disabled")&&this.disable()},refresh:function(a){var b=this.element,c=this.options,e=this.menu,h=this.checkboxContainer, g=[],f=[],i=b.attr("id")||j++;b.find("option").each(function(b){d(this);var a=this.parentNode,e=this.innerHTML,h=this.title,j=this.value,b=this.id||"ui-multiselect-"+i+"-option-"+b,k=this.disabled,m=this.selected,l=["ui-corner-all"];"optgroup"===a.tagName.toLowerCase()&&(a=a.getAttribute("label"),-1===d.inArray(a,g)&&(f.push('<li class="ui-multiselect-optgroup-label"><a href="#">'+a+"</a></li>"),g.push(a)));k&&l.push("ui-state-disabled");m&&!c.multiple&&l.push("ui-state-active");f.push('<li class="'+ (k?"ui-multiselect-disabled":"")+'">');f.push('<label for="'+b+'" title="'+h+'" class="'+l.join(" ")+'">');f.push('<input id="'+b+'" name="multiselect_'+i+'" type="'+(c.multiple?"checkbox":"radio")+'" value="'+j+'" title="'+e+'"');m&&(f.push(' checked="checked"'),f.push(' aria-selected="true"'));k&&(f.push(' disabled="disabled"'),f.push(' aria-disabled="true"'));f.push(" /><span>"+e+"</span></label></li>")});h.html(f.join(""));this.labels=e.find("label");this._setButtonWidth();this._setMenuWidth(); this.button[0].defaultValue=this.update();a||this._trigger("refresh")},update:function(){var a=this.options,b=this.labels.find("input"),c=b.filter("[checked]"),e=c.length,a=0===e?a.noneSelectedText:d.isFunction(a.selectedText)?a.selectedText.call(this,e,b.length,c.get()):/\d/.test(a.selectedList)&&0<a.selectedList&&e<=a.selectedList?c.map(function(){return d(this).next().text()}).get().join(", "):a.selectedText.replace("#",e).replace("#",b.length);this.buttonlabel.html(a);return a},_bindEvents:function(){function a(){b[b._isOpen?  "close":"open"]();return!1}var b=this,c=this.button;c.find("span").bind("click.multiselect",a);c.bind({click:a,keypress:function(a){switch(a.which){case 27:case 38:case 37:b.close();break;case 39:case 40:b.open()}},mouseenter:function(){c.hasClass("ui-state-disabled")||d(this).addClass("ui-state-hover")},mouseleave:function(){d(this).removeClass("ui-state-hover")},focus:function(){c.hasClass("ui-state-disabled")||d(this).addClass("ui-state-focus")},blur:function(){d(this).removeClass("ui-state-focus")}}); this.header.delegate("a","click.multiselect",function(a){if(d(this).hasClass("ui-multiselect-close"))b.close();else b[d(this).hasClass("ui-multiselect-all")?"checkAll":"uncheckAll"]();a.preventDefault()});this.menu.delegate("li.ui-multiselect-optgroup-label a","click.multiselect",function(a){a.preventDefault();var c=d(this),g=c.parent().nextUntil("li.ui-multiselect-optgroup-label").find("input:visible:not(:disabled)"),f=g.get(),c=c.parent().text();!1!==b._trigger("beforeoptgrouptoggle",a,{inputs:f, label:c})&&(b._toggleChecked(g.filter("[checked]").length!==g.length,g),b._trigger("optgrouptoggle",a,{inputs:f,label:c,checked:f[0].checked}))}).delegate("label","mouseenter.multiselect",function(){d(this).hasClass("ui-state-disabled")||(b.labels.removeClass("ui-state-hover"),d(this).addClass("ui-state-hover").find("input").focus())}).delegate("label","keydown.multiselect",function(a){a.preventDefault();switch(a.which){case 9:case 27:b.close();break;case 38:case 40:case 37:case 39:b._traverse(a.which, this);break;case 13:d(this).find("input")[0].click()}}).delegate('input[type="checkbox"], input[type="radio"]',"click.multiselect",function(a){var c=d(this),g=this.value,f=this.checked,i=b.element.find("option");this.disabled||!1===b._trigger("click",a,{value:g,text:this.title,checked:f})?a.preventDefault():(c.focus(),c.attr("aria-selected",f),i.each(function(){if(this.value===g)this.selected=f;else if(!b.options.multiple)this.selected=!1}),b.options.multiple||(b.labels.removeClass("ui-state-active"), c.closest("label").toggleClass("ui-state-active",f),b.close()),b.element.trigger("change"),setTimeout(d.proxy(b.update,b),10))});d(document).bind("mousedown.multiselect",function(a){b._isOpen&&!d.contains(b.menu[0],a.target)&&!d.contains(b.button[0],a.target)&&a.target!==b.button[0]&&b.close()});d(this.element[0].form).bind("reset.multiselect",function(){setTimeout(d.proxy(b.refresh,b),10)})},_setButtonWidth:function(){var a=this.element.outerWidth(),b=this.options;if(/\d/.test(b.minWidth)&&a<b.minWidth)a= b.minWidth;this.button.width(a)},_setMenuWidth:function(){var a=this.menu,b=this.button.outerWidth()-parseInt(a.css("padding-left"),10)-parseInt(a.css("padding-right"),10)-parseInt(a.css("border-right-width"),10)-parseInt(a.css("border-left-width"),10);a.width(b||this.button.outerWidth())},_traverse:function(a,b){var c=d(b),e=38===a||37===a,c=c.parent()[e?"prevAll":"nextAll"]("li:not(.ui-multiselect-disabled, .ui-multiselect-optgroup-label)")[e?"last":"first"]();c.length?c.find("label").trigger("mouseover"): (c=this.menu.find("ul").last(),this.menu.find("label")[e?"last":"first"]().trigger("mouseover"),c.scrollTop(e?c.height():0))},_toggleState:function(a,b){return function(){this.disabled||(this[a]=b);b?this.setAttribute("aria-selected",!0):this.removeAttribute("aria-selected")}},_toggleChecked:function(a,b){var c=b&&b.length?b:this.labels.find("input"),e=this;c.each(this._toggleState("checked",a));c.eq(0).focus();this.update();var h=c.map(function(){return this.value}).get();this.element.find("option").each(function(){!this.disabled&& -1<d.inArray(this.value,h)&&e._toggleState("selected",a).call(this)});c.length&&this.element.trigger("change")},_toggleDisabled:function(a){this.button.attr({disabled:a,"aria-disabled":a})[a?"addClass":"removeClass"]("ui-state-disabled");this.menu.find("input").attr({disabled:a,"aria-disabled":a}).parent()[a?"addClass":"removeClass"]("ui-state-disabled");this.element.attr({disabled:a,"aria-disabled":a})},open:function(){var a=this.button,b=this.menu,c=this.speed,e=this.options;if(!(!1===this._trigger("beforeopen")|| a.hasClass("ui-state-disabled")||this._isOpen)){var h=b.find("ul").last(),g=e.show,f=a.offset();d.isArray(e.show)&&(g=e.show[0],c=e.show[1]||this.speed);h.scrollTop(0).height(e.height);d.ui.position&&!d.isEmptyObject(e.position)?(e.position.of=e.position.of||a,b.show().position(e.position).hide().show(g,c)):b.css({top:f.top+a.outerHeight(),left:f.left}).show(g,c);this.labels.eq(0).trigger("mouseover").trigger("mouseenter").find("input").trigger("focus");a.addClass("ui-state-active");this._isOpen= !0;this._trigger("open")}},close:function(){if(!1!==this._trigger("beforeclose")){var a=this.options,b=a.hide,c=this.speed;d.isArray(a.hide)&&(b=a.hide[0],c=a.hide[1]||this.speed);this.menu.hide(b,c);this.button.removeClass("ui-state-active").trigger("blur").trigger("mouseleave");this._isOpen=!1;this._trigger("close")}},enable:function(){this._toggleDisabled(!1)},disable:function(){this._toggleDisabled(!0)},checkAll:function(){this._toggleChecked(!0);this._trigger("checkAll")},uncheckAll:function(){this._toggleChecked(!1); this._trigger("uncheckAll")},getChecked:function(){return this.menu.find("input").filter("[checked]")},destroy:function(){d.Widget.prototype.destroy.call(this);this.button.remove();this.menu.remove();this.element.show();return this},isOpen:function(){return this._isOpen},widget:function(){return this.menu},_setOption:function(a,b){var c=this.menu;switch(a){case "header":c.find("div.ui-multiselect-header")[b?"show":"hide"]();break;case "checkAllText":c.find("a.ui-multiselect-all span").eq(-1).text(b); break;case "uncheckAllText":c.find("a.ui-multiselect-none span").eq(-1).text(b);break;case "height":c.find("ul").last().height(parseInt(b,10));break;case "minWidth":this.options[a]=parseInt(b,10);this._setButtonWidth();this._setMenuWidth();break;case "selectedText":case "selectedList":case "noneSelectedText":this.options[a]=b;this.update();break;case "classes":c.add(this.button).removeClass(this.options.classes).addClass(b)}d.Widget.prototype._setOption.apply(this,arguments)}})})(jQuery);


/*
 * jQuery MultiSelect UI Widget Filtering Plugin 1.4
 * Copyright (c) 2011 Eric Hynds
 *
 * http://www.erichynds.com/jquery/jquery-ui-multiselect-widget/
 *
 * Depends:
 *   - jQuery UI MultiSelect widget
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
*/
(function(a){var f=/[\-\[\]{}()*+?.,\\\^$|#\s]/g;a.widget("ech.multiselectfilter",{options:{label:"Filter:",width:null,placeholder:"Enter keywords",autoReset:!1},_create:function(){var e;var b=this,c=this.options,d=this.instance=a(this.element).data("multiselect");this.header=d.menu.find(".ui-multiselect-header").addClass("ui-multiselect-hasfilter");e=this.wrapper=a('<div class="ui-multiselect-filter">'+(c.label.length?c.label:"")+'<input placeholder="'+c.placeholder+'" type="search"'+(/\d/.test(c.width)?  'style="width:'+c.width+'px"':"")+" /></div>").prependTo(this.header),c=e;this.inputs=d.menu.find('input[type="checkbox"], input[type="radio"]');this.input=c.find("input").bind({keydown:function(a){13===a.which&&a.preventDefault()},keyup:a.proxy(b._handler,b),click:a.proxy(b._handler,b)});this.updateCache();d._toggleChecked=function(c,d){var e=d&&d.length?d:this.labels.find("input"),i=this,e=e.not(b.instance._isOpen?":disabled, :hidden":":disabled").each(this._toggleState("checked",c));this.update(); var j=e.map(function(){return this.value}).get();this.element.find("option").filter(function(){!this.disabled&&-1<a.inArray(this.value,j)&&i._toggleState("selected",c).call(this)})};d=a(document).bind("multiselectrefresh",function(){b.updateCache();b._handler()});this.options.autoReset&&d.bind("multiselectclose",a.proxy(this._reset,this))},_handler:function(b){var c=a.trim(this.input[0].value.toLowerCase()),d=this.rows,g=this.inputs,h=this.cache;if(c){d.hide();var e=RegExp(c.replace(f,"\\$&"),"gi"); this._trigger("filter",b,a.map(h,function(a,b){return-1!==a.search(e)?(d.eq(b).show(),g.get(b)):null}))}else d.show();this.instance.menu.find(".ui-multiselect-optgroup-label").each(function(){var b=a(this),c=b.nextUntil(".ui-multiselect-optgroup-label").filter(function(){return"none"!==a.css(this,"display")}).length;b[c?"show":"hide"]()})},_reset:function(){this.input.val("").trigger("keyup")},updateCache:function(){this.rows=this.instance.menu.find(".ui-multiselect-checkboxes li:not(.ui-multiselect-optgroup-label)");this.cache=this.element.children().map(function(){var b=a(this);"optgroup"===this.tagName.toLowerCase()&&(b=b.children());return b.map(function(){return this.innerHTML.toLowerCase()}).get()}).get()},widget:function(){return this.wrapper},destroy:function(){a.Widget.prototype.destroy.call(this);this.input.val("").trigger("keyup");this.wrapper.remove()}})})(jQuery);


/*!
 * jQuery Cycle Lite Plugin
 * http://malsup.com/jquery/cycle/lite/
 * Copyright (c) 2008-2011 M. Alsup
 * Version: 1.3.1 (07-OCT-2011)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * Requires: jQuery v1.3.2 or later
 */
(function(a){function d(a,b,d){var e=a[0].parentNode,f=e.cycleTimeout;if(f){clearTimeout(f);e.cycleTimeout=0}b.nextSlide=b.currSlide+d;if(b.nextSlide<0){b.nextSlide=a.length-1}else if(b.nextSlide>=a.length){b.nextSlide=0}c(a,b,1,d>=0);return false}function c(b,d,e,f){function l(){if(d.timeout)g.cycleTimeout=setTimeout(function(){c(b,d,0,!d.rev)},d.timeout)}if(d.busy)return;var g=b[0].parentNode,h=b[d.currSlide],i=b[d.nextSlide];if(g.cycleTimeout===0&&!e)return;if(e||!g.cyclePause){if(d.before.length)a.each(d.before,function(a,b){b.apply(i,[h,i,d,f])});var j=function(){if(a.browser.msie)this.style.removeAttribute("filter");a.each(d.after,function(a,b){b.apply(i,[h,i,d,f])});l()};if(d.nextSlide!=d.currSlide){d.busy=1;a.fn.cycle.custom(h,i,d,j)}var k=d.nextSlide+1==b.length;d.nextSlide=k?0:d.nextSlide+1;d.currSlide=k?b.length-1:d.nextSlide-1}}var b="Lite-1.3";a.fn.cycle=function(b){return this.each(function(){b=b||{};if(this.cycleTimeout)clearTimeout(this.cycleTimeout);this.cycleTimeout=0;this.cyclePause=0;var e=a(this);var f=b.slideExpr?a(b.slideExpr,this):e.children();var g=f.get();if(g.length<2){window.console&&console.log("terminating; too few slides: "+g.length);return}var h=a.extend({},a.fn.cycle.defaults,b||{},a.metadata?e.metadata():a.meta?e.data():{});var i=a.isFunction(e.data)?e.data(h.metaAttr):null;if(i)h=a.extend(h,i);h.before=h.before?[h.before]:[];h.after=h.after?[h.after]:[];h.after.unshift(function(){h.busy=0});var j=this.className;h.width=parseInt((j.match(/w:(\d+)/)||[])[1])||h.width;h.height=parseInt((j.match(/h:(\d+)/)||[])[1])||h.height;h.timeout=parseInt((j.match(/t:(\d+)/)||[])[1])||h.timeout;if(e.css("position")=="static")e.css("position","relative");if(h.width)e.width(h.width);if(h.height&&h.height!="auto")e.height(h.height);var k=0;f.css({position:"absolute",top:0,left:0}).each(function(b){a(this).css("z-index",g.length-b)});a(g[k]).css("opacity",1).show();if(a.browser.msie)g[k].style.removeAttribute("filter");if(h.fit&&h.width)f.width(h.width);if(h.fit&&h.height&&h.height!="auto")f.height(h.height);if(h.pause)e.hover(function(){this.cyclePause=1},function(){this.cyclePause=0});var l=a.fn.cycle.transitions[h.fx];l&&l(e,f,h);f.each(function(){var b=a(this);this.cycleH=h.fit&&h.height?h.height:b.height();this.cycleW=h.fit&&h.width?h.width:b.width()});if(h.cssFirst)a(f[k]).css(h.cssFirst);if(h.timeout){if(h.speed.constructor==String)h.speed={slow:600,fast:200}[h.speed]||400;if(!h.sync)h.speed=h.speed/2;while(h.timeout-h.speed<250)h.timeout+=h.speed}h.speedIn=h.speed;h.speedOut=h.speed;h.slideCount=g.length;h.currSlide=k;h.nextSlide=1;var m=f[k];if(h.before.length)h.before[0].apply(m,[m,m,h,true]);if(h.after.length>1)h.after[1].apply(m,[m,m,h,true]);if(h.click&&!h.next)h.next=h.click;if(h.next)a(h.next).bind("click",function(){return d(g,h,h.rev?-1:1)});if(h.prev)a(h.prev).bind("click",function(){return d(g,h,h.rev?1:-1)});if(h.timeout)this.cycleTimeout=setTimeout(function(){c(g,h,0,!h.rev)},h.timeout+(h.delay||0))})};a.fn.cycle.custom=function(b,c,d,e){var f=a(b),g=a(c);g.css(d.cssBefore);var h=function(){g.animate(d.animIn,d.speedIn,d.easeIn,e)};f.animate(d.animOut,d.speedOut,d.easeOut,function(){f.css(d.cssAfter);if(!d.sync)h()});if(d.sync)h()};a.fn.cycle.transitions={fade:function(a,b,c){b.not(":eq(0)").hide();c.cssBefore={opacity:0,display:"block"};c.cssAfter={display:"none"};c.animOut={opacity:0};c.animIn={opacity:1}},fadeout:function(b,c,d){d.before.push(function(b,c,d,e){a(b).css("zIndex",d.slideCount+(e===true?1:0));a(c).css("zIndex",d.slideCount+(e===true?0:1))});c.not(":eq(0)").hide();d.cssBefore={opacity:1,display:"block",zIndex:1};d.cssAfter={display:"none",zIndex:0};d.animOut={opacity:0}}};a.fn.cycle.ver=function(){return b};a.fn.cycle.defaults={animIn:{},animOut:{},fx:"fade",after:null,before:null,cssBefore:{},cssAfter:{},delay:0,fit:0,height:"auto",metaAttr:"cycle",next:null,pause:0,prev:null,speed:1e3,slideExpr:null,sync:1,timeout:4e3}})(jQuery)
