// Add left and right labels to jQuery UI Slider
$.fn.extend({
    sliderLabels: function(left,right) {
        var $this = $(this);
        var $sliderdiv= $this;
        $sliderdiv
        .css({'font-weight': 'normal'});
        $sliderdiv
        .prepend('<span class="ui-slider-inner-label"  style="position: absolute; left:15px; bottom: 0; font-size: 12px; ">'+left+ '</span>')
        .append('<span class="ui-slider-inner-label" style="position: absolute; left:15px; top: 0; font-size: 12px;">'+right+ '</span>');
    }
});
