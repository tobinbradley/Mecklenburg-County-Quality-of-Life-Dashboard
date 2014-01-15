//very much based off of http://bost.ocks.org/mike/leaflet/
L.D3 = L.Class.extend({
	includes: L.Mixin.Events,
	options:{
		type:"json",
		topojson:false,
		pathClass:"",
        featureID: "id"
	},
	initialize: function (data,options) {
		var _this = this;
		L.setOptions(_this, options);
		_this._loaded=false;
		if(typeof data === "string"){
			d3[_this.options.type](data,function(err,json){
				if(err){
					return;
				}else{
					if(_this.options.topojson){
						_this.data = topojson.object(json, json.objects[_this.options.topojson]);
					}else if(L.Util.isArray(json)){
						_this.data = {type:"FeatureCollection",features:json};
					}else{
						_this.data = json;
					}
					_this._loaded = true;
					_this.fire("dataLoaded");
				}
			});
		}else{
			if(_this.options.topojson){
				_this.data = topojson.object(data, data.objects[_this.options.topojson]);
			}else if(L.Util.isArray(data)){
				_this.data={type:"FeatureCollection",features:data};
			}else{
				_this.data = data;
			}
			_this._loaded = true;
			_this.fire("dataLoaded");
		}

	},
	onAdd: function (map) {
		this._map = map;
		this._project = function (x) {
			var point = map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
			return [point.x, point.y];
		};
		this._el = d3.select(this._map.getPanes().overlayPane).append("svg");
		this._g = this._el.append("g").attr("class",this.options.svgClass?this.options.svgClass+" leaflet-zoom-hide":"leaflet-zoom-hide");
		if(this._loaded){
			this.onLoaded();
		}else{
			this.on("dataLoaded",this.onLoaded,this);
		}
		this.fire("added");
	},
	addTo: function (map) {
		map.addLayer(this);
		return this;
	},
	onLoaded: function(){
		this.bounds = d3.geo.bounds(this.data);
		this.path = d3.geo.path().projection(this._project);
		if(this.options.before){
			this.options.before.call(this, this.data);
		}
		var opts = this.options;
        this._feature = this._g.selectAll("path").data(this.options.topojson?this.data.geometries:this.data.features).enter().append("path").attr("class", this.options.pathClass).attr("data-id", function(d) { return d[opts.featureID]; }).attr("fill", "none");
		this._map.on('viewreset', this._reset, this);
		this._reset();
	},
	onRemove: function (map) {
		// remove layer's DOM elements and listeners
		this._el.remove();
		map.off('viewreset', this._reset, this);
	},

	_reset: function () {
		 var bottomLeft = this._project(this.bounds[0]),
        topRight = this._project(this.bounds[1]);

    this._el .attr("width", topRight[0] - bottomLeft[0])
        .attr("height", bottomLeft[1] - topRight[1])
        .style("margin-left", bottomLeft[0] + "px")
        .style("margin-top", topRight[1] + "px");

    this._g   .attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");

    this._feature.attr("d", this.path);
	}


});
L.d3=function(data,options){
	return new L.D3(data,options);
};
