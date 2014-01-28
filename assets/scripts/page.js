var map,                // leaflet map
    quantize,           // d3 quantizer for color breaks
    x_extent,           // extent of the metric, including all years
    metricData = [],    // each element is object {'year': the year, 'map': d3 map of data}
    timer,              // timer for year slider
    year,               // the currently selected year as array index of metricData
    barchartWidth,      // for responsive charts
    mapcenter,           // hack to fix d3 click firing on leaflet drag
    marker,             // marker for geocode
    colorbreaks = 7     // the number of color breaks
    ;

PubSub.immediateExceptions = true; // set to false in production

String.prototype.commafy = function () {
    return this.replace(/(^|[^\w.])(\d{4,})/g, function($0, $1, $2) {
        return $1 + $2.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,");
    });
};
Number.prototype.commafy = function () {
    return String(this).commafy();
};

// Slider change event
function sliderChange(value) {
    $('.time-year').text(metricData[value].year.replace("y_", ""));
    year = value;
    PubSub.publish('changeYear');
}

$(document).ready(function () {

    // TODO: set metric selected if argument passed
    var $options = $('.chosen-select').find('option'),
        random = Math.floor((Math.random() * $options.length));
    $options.eq(random).prop('selected', true);

    // chosen
    $(".chosen-select").chosen({width: '100%', no_results_text: "Not found - "}).change(function () {
        var theVal = $(this).val();
        d3.csv("data/metric/" + theVal + ".csv", changeMetric);
        $(this).trigger("chosen:updated");
    });

    // clear selection button
    $(".select-clear").on("click", function() {
        d3.selectAll(".geom path").classed("d3-select", false);
        d3.selectAll(".mean-select .mean-triangle").remove();
        try { map.removeLayer(marker); }
        catch (err) {}
    });

    // time slider
    $(".slider").slider({
        value: 1,
        min: 0,
        max: 1,
        step: 1,
        animate: true,
        slide: function( event, ui ) {
            sliderChange(ui.value);
        }
    });

    // time looper
    $(".btn-looper").on("click", function () {
        var that = $(this).children("span");
        var theSlider = $('.slider');
        if (that.hasClass("glyphicon-play")) {
            that.removeClass("glyphicon-play").addClass("glyphicon-pause");
            if (theSlider.slider("value") === theSlider.slider("option", "max")) {
                theSlider.slider("value", 0);
            }
            else {
                theSlider.slider("value", theSlider.slider("value") + 1);
            }
            sliderChange(theSlider.slider("value"));
            timer = setInterval(function () {
                    if (theSlider.slider("value") === theSlider.slider("option", "max")) {
                        theSlider.slider("value", 0);
                    }
                    else {
                        theSlider.slider("value", theSlider.slider("value") + 1);
                    }
                    sliderChange(theSlider.slider("value"));
                }, 3000);
        }
        else {
            that.removeClass("glyphicon-pause").addClass("glyphicon-play");
            clearInterval(timer);
        }
    });

    // jQuery UI Autocomplete
    $("#searchbox").click(function () { $(this).select(); }).focus();
    $('.typeahead').typeahead([
        {
            name: 'Address',
            remote: {
                url: 'http://maps.co.mecklenburg.nc.us/rest/v4/ws_geo_ubersearch.php?searchtypes=address&query=%QUERY',
                dataType: 'jsonp',
                filter: function (data) {
                    var dataset = [];
                    _.each(data, function (item) {
                        dataset.push({
                            value: item.name,
                            label: item.name,
                            gid: item.gid,
                            pid: item.moreinfo,
                            layer: 'Address',
                            lat: item.lat,
                            lng: item.lng
                        });
                    });
                    var query = $(".typeahead").val();
                    if (dataset.length === 0 && $.isNumeric(query.split(" ")[0]) && query.trim().split(" ").length > 1) {
                        dataset.push({ value: "No records found." });
                    }
                    return dataset;
                }
            },
            minLength: 4,
            limit: 10,
            header: '<h4 class="typeahead-header"><span class="glyphicon glyphicon-map-marker"></span> Address</h4>'
        }, {
            name: 'PID',
            remote: {
                url: 'http://maps.co.mecklenburg.nc.us/rest/v4/ws_geo_ubersearch.php?searchtypes=pid&query=%QUERY',
                dataType: 'jsonp',
                filter: function (data) {
                    var dataset = [];
                    _.each(data, function (item) {
                        dataset.push({
                            value: item.name,
                            label: item.moreinfo,
                            gid: item.gid,
                            pid: item.name,
                            layer: 'PID',
                            lat: item.lat,
                            lng: item.lng
                        });
                    });
                    var query = $(".typeahead").val();
                    if (dataset.length === 0 && query.length === 8 && query.indexOf(" ") === -1 && $.isNumeric(query.substring(0, 5))) {
                        dataset.push({ value: "No records found." }); }
                    return dataset;
                }
            },
            minLength: 8,
            limit: 5,
            header: '<h4 class="typeahead-header"><span class="glyphicon glyphicon-home"></span> Parcel</h4>'
        }, {
            name: 'POI',
            remote: {
                url: 'http://maps.co.mecklenburg.nc.us/rest/v4/ws_geo_ubersearch.php?searchtypes=park,library,school&query=%QUERY',
                dataType: 'jsonp',
                filter: function (data) {
                    var dataset = [];
                    _.each(data, function (item) {
                        dataset.push({
                            value: item.name,
                            label: item.name,
                            layer: 'Point of Interest',
                            lat: item.lat,
                            lng: item.lng
                        });
                    });
                    if (dataset.length === 0) { dataset.push({ value: "No records found." }); }
                    return _(dataset).sortBy("value");
                }
            },
            minLength: 4,
            limit: 15,
            header: '<h4 class="typeahead-header"><span class="glyphicon glyphicon-star"></span> Point of Interest</h4>'
        }, {
            name: 'business',
            remote: {
                url: 'http://maps.co.mecklenburg.nc.us/rest/v4/ws_geo_ubersearch.php?searchtypes=business&query=%QUERY',
                dataType: 'jsonp',
                filter: function (data) {
                    var dataset = [];
                    _.each(data, function (item) {
                        dataset.push({
                            value: item.name,
                            label: item.name,
                            layer: 'Point of Interest',
                            lat: item.lat,
                            lng: item.lng
                        });
                    });
                    if (dataset.length === 0) { dataset.push({ value: "No records found." }); }
                    return _(dataset).sortBy("value");
                }
            },
            minLength: 4,
            limit: 15,
            header: '<h4 class="typeahead-header"><span class="glyphicon glyphicon-briefcase"></span> Business</h4>'
        }, {
            name: 'npa',
            //local: metricData[0].map.keys().toString().split(','),
            local: ['2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69','70','71','72','73','74','75','76','77','78','79','80','81','82','83','84','85','86','87','88','89','90','91','92','93','94','95','96','97','98','99','100','101','102','103','104','105','106','107','108','109','110','111','112','113','114','115','116','117','118','119','120','121','122','123','124','125','126','127','128','129','130','131','132','133','134','135','136','137','138','139','140','141','142','143','144','145','146','147','148','149','150','151','152','153','154','155','156','157','158','159','160','161','162','163','164','165','166','167','168','169','170','171','172','173','174','175','176','177','178','179','180','181','182','183','184','185','186','187','188','189','190','191','192','193','194','195','196','197','198','199','200','201','202','203','204','205','206','207','208','209','210','211','212','213','215','216','217','218','219','220','221','222','223','224','225','226','227','228','229','230','231','232','233','234','235','236','237','238','240','241','242','243','244','245','246','247','248','249','250','251','252','253','254','255','256','257','258','259','260','261','262','263','264','265','266','267','268','269','270','271','272','273','274','275','276','277','278','279','280','281','282','283','284','285','286','287','288','289','290','291','292','293','294','295','296','297','298','299','300','301','302','303','304','305','306','307','308','309','310','311','312','313','314','315','316','317','318','319','320','321','322','323','324','325','326','327','328','329','330','331','332','333','334','335','336','337','338','339','340','341','342','343','344','345','346','347','348','349','350','351','352','353','354','355','356','357','358','359','360','361','362','363','364','365','366','367','368','369','370','371','372','373','374','375','376','377','378','379','380','381','382','383','384','385','386','387','388','389','390','391','392','393','394','395','396','397','398','399','400','401','402','403','404','405','406','407','408','409','410','411','412','413','416','417','418','419','420','421','422','423','424','425','426','428','430','431','432','433','434','435','436','437','438','442','443','444','445','446','447','448','449','450','451','452','453','454','455','456','457','458','459','460','462','463','464','465','466','467','468','469','470','471','472','473','474','475'],
            header: '<h4 class="typeahead-header"><span class="glyphicon glyphicon-home"></span> NPA</h4>'
        }
    ]).on('typeahead:selected', function (obj, datum) {
        if (datum.lat) {
            $.ajax({
                url: 'http://maps.co.mecklenburg.nc.us/rest/v2/ws_geo_pointoverlay.php',
                type: 'GET',
                dataType: 'jsonp',
                data: {
                    'x': datum.lng,
                    'y': datum.lat,
                    'srid': 4326,
                    'table': 'neighborhoods',
                    'fields': 'id'
                },
                success: function (data) {
                    var sel = d3.select(".geom path[data-id='" + data[0].id + "']");
                    PubSub.publish('geocode', {
                        "id": data[0].id,
                        "value": sel.attr("data-value"),
                        "d3obj": sel,
                        "lat": datum.lat,
                        "lng": datum.lng
                    });
                }
            });
        }
        else {
            // select neighborhood
            var sel = d3.select(".geom path[data-id='" + datum.value + "']");
            PubSub.publish('findNeighborhood', {
                "d3obj": sel
            });
        }
    });
    $("#btn-search").bind("click", function (event) {
        $('.typeahead').focus();
    });


    // subscriptions
    PubSub.subscribe('initialize', processMetric);
    PubSub.subscribe('initialize', drawMap);
    PubSub.subscribe('initialize', updateMeta);
    PubSub.subscribe('initialize', drawBarChart);
    PubSub.subscribe('initialize', drawLineChart);
    PubSub.subscribe('changeYear', drawMap);
    PubSub.subscribe('changeYear', drawBarChart);
    PubSub.subscribe('changeYear', drawLineChart);
    PubSub.subscribe('changeYear', updateChartMarkers);
    PubSub.subscribe('changeMetric', processMetric);
    PubSub.subscribe('changeMetric', drawMap);
    PubSub.subscribe('changeMetric', drawBarChart);
    PubSub.subscribe('changeMetric', drawLineChart);
    PubSub.subscribe('changeMetric', updateChartMarkers);
    PubSub.subscribe('changeMetric', updateMeta);
    PubSub.subscribe('selectGeo', d3Select);
    PubSub.subscribe('geocode', d3Zoom);
    PubSub.subscribe('geocode', d3Select);
    PubSub.subscribe('geocode', addMarker);
    PubSub.subscribe('findNeighborhood', d3Select);
    PubSub.subscribe('findNeighborhood', d3Zoom);

    // set up map
    map = L.map("map", {
            zoomControl: true,
            attributionControl: false,
            scrollWheelZoom: true,
            zoomAnimation: false,
            minZoom: 9,
            maxZoom: 17
        }).setView([35.260, -80.827],10);

    L.Icon.Default.imagePath = "images/";

    // Mecklenburg Base Layer
    var baseTiles = L.tileLayer("http://maps.co.mecklenburg.nc.us/tiles/meckbase/{y}/{x}/{z}.png");

    // Year control
    var yearControl = L.control({position: 'bottomright'});
    yearControl.onAdd = function(map) {
        this._div = L.DomUtil.create('div', 'yearDisplay');
        this._div.innerHTML = '<h3 class="time-year">2012</h3>';
        return this._div;
    };
    yearControl.addTo(map);

    // map typeahead
    // var mapsearch = L.control({position: 'topcenter'});
    // mapsearch.onAdd = function(map) {
    //     this._div = L.DomUtil.create('div', 'yearDisplay');
    //     this._div.innerHTML = '<h3 class="time-year">2012</h3>';
    //     return this._div;
    // };
    // mapsearch.addTo(map);

    // Layer control
    // L.control.layers( {} , {"Base Map": baseTiles}).addTo(map);
    // map.on('overlayadd',function(e){
    //     // test for e.name === "Base Map"
    //     $(".neighborhoods path").css("opacity", "0.6");

    // });
    // map.on('overlayremove',function(e){
    //     $(".neighborhoods path").css("opacity", "1");
    // });

    map.on("zoomend", function() {
        if (map.getZoom() >= 15) {
            $(".geom path").css("fill-opacity", "0.5");
            map.addLayer(baseTiles);
        } else {
            $(".geom path").css("fill-opacity", "1");
            map.removeLayer(baseTiles);
        }
    });


    queue()
        .defer(d3.json, "data/npa.topo.json")
        .defer(d3.csv, "data/metric/" + $("#metric").val() + ".csv")
        .await(draw);


    d3.select(window).on("resize", function () {
        if ($(".barchart").parent().width() !== barchartWidth) {
            drawBarChart();
            drawLineChart();
        }
    });


});

function draw(error, geom, data) {
    PubSub.publish('initialize', {
        "geom": geom,
        "metricdata": data,
        'metric': $("#metric").val()
    });
}

function changeMetric(error, data) {
    $(".d3-tip").remove();
    PubSub.publish('changeMetric', {
        'metricdata': data,
        'metric': $("#metric").val()
    });
}

function GetSubstringIndex(str, substring, n) {
    var times = 0, index = null;
    while (times < n && index !== -1) {
        index = str.indexOf(substring, index+1);
        times++;
    }
    return index;
}

function updateMeta(msg, d) {
    $.ajax({
        url: 'data/meta/' + d.metric + '.md',
        type: 'GET',
        dataType: 'text',
        success: function (data) {
            var converter = new Markdown.Converter();
            var html = converter.makeHtml(data);
            $('.meta-subtitle').html(
                html.substring(GetSubstringIndex(html, '</h2>', 1) + 5, GetSubstringIndex(html, '<h3>', 1))
            );
            $('.meta-important').html(
                html.substring(GetSubstringIndex(html, '</h3>', 1) + 5, GetSubstringIndex(html, '<h3>', 2))
            );
            $('.meta-about').html(
                html.substring(GetSubstringIndex(html, '</h3>', 2) + 5, GetSubstringIndex(html, '<h3>', 3))
            );
            $('.meta-resources').html(
                html.substring(GetSubstringIndex(html, '</h3>', 3) + 5, html.length)
            );
        },
        error: function (error, status, desc) {
            console.log(status, desc);
        }
    });
}

function processMetric(msg, data) {
    // clear metric data
    metricData.length = 0;

    var keys = Object.keys(data.metricdata[0]);
    for (var i = 1; i < keys.length; i++) {
        metricData.push({"year": keys[i], "map": d3.map()});
    }

    // set slider
    year = metricData.length -1;
    $(".slider").slider("option", "max", year).slider("value", year);
    metricData.length > 1 ? $(".year-slider").fadeIn() : $(".year-slider").hide();
    $('.time-year').text(metricData[metricData.length - 1].year.replace("y_", ""));


    _.each(data.metricdata, function (d) {
        for (var i = 0; i < metricData.length; i++) {
            if ($.isNumeric(d[metricData[i].year])) { metricData[i].map.set(d.id, parseFloat(d[metricData[i].year])); }
        }
    });

    // Set up extent
    var extentArray = [];
    _.each(metricData, function(d) { extentArray = extentArray.concat(d.map.values()); });
    x_extent = d3.extent(extentArray);

    // set up quantile
    quantize = d3.scale.quantile()
        .domain(x_extent)
        .range(d3.range(7).map(function (i) {
            return "q" + i;
        }));
}



function dataPretty(theMetric, theValue) {
    var m = _.filter(dataMeta, function (d) { return d.id === theMetric; });
    var fmat = d3.format("0,000.0");
    if (m.length === 1) {
        if (m[0].units === "percent") {
            return fmat(theValue) + "%";
        }
        else if (m[0].units === "year") {
            return theValue;
        }
        else {
            return fmat(theValue) + " " + m[0].units;
        }
    }
    else {
        return fmat(theValue);
    }
}
