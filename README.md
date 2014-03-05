Quality of Life Dashboard v2 Alpha
=================

A joint project between the City of Charlotte, Mecklenburg County, and UNCC. A reasonably up-to-date version of this dev branch is [here](http://mcmap.org/qol/). The current site site launched in January 2013 and is over [here](http://maps.co.mecklenburg.nc.us/qoldashboard). There's no launch date for the next release yet. You can see what I'm banging on at [Trello](https://trello.com/b/GxsdKVUl/quality-of-life-dashboard).

The new project uses D3 for visualizations. The good news is besides all the cool features in the new version has it is less than half the size over the wire and loads over twice as fast. The bad news is IE8 absolutely will not work. If you really need to support IE8, stick with the current release.

This sucker is still baking, but most things work. The topojson is linked to data in json files via the `id` field. The json files are linked to metrics via the file name (it's the value of the select). So to add data, you'd make a CSV formatted like `id, y_2012, y_2013`, with y_year being each year there is data. Null values are empty (i.e. 123,,32).

The meta is pretty sloppy - some markdown that is being hand parsed with henious lefts and rights. You'll probably need to screw with it. What can I tell you, I needed *normals* to edit that stuff.

Things to customize for your data:
+ The hella select needs your metrics with the value being the CSV file to fetch.
+ The map center, zoom, and any base tiles.
+ For the D3 layer, customize the id field (the default is `id`) of the layer along with the subclass in the topojson (here it's `npa2`).
+ For shapefile to topojson I'm using `topojson -o npa.json -s 7e-11  --id-property=+id  npa.shp`

How to set up:
+ Install nodejs
+ `npm install -g gulp bower`
+ `bower install`
+ `npm install`
+ `gulp dev` for development (includes Live Reload)
+ `gulp build` for deployment build
