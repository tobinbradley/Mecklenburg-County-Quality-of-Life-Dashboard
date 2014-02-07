Quality of Life Dashboard v2 Alpha
=================

A joint project between the City of Charlotte, Mecklenburg County, and UNCC. A reasonably up-to-date version of this dev branch is [here](http://tobinbradley.github.io/Mecklenburg-County-Quality-of-Life-Dashboard/). The current site site launched in January 2013 and is over [here](http://maps.co.mecklenburg.nc.us/qoldashboard).

The new project uses D3 for visualizations. Leaflet holds the D3 layer for the time being but that may change. The good news is despite the new capabilities the dev branch is less than half the size (935kb vs 2425kb) and load time is down to 1.09s (vs 2.29s), and I haven't really started optimizing it yet. It will also be much easier for us (and others) to add their own data on the backend. The bad news is IE8 absolutely will not work (D3=SVG). If you really need to support IE8, stick with the current release.

This sucker is still baking, but most things should work. The topojson is linked to data in CSV files via the `id` field. The CSV files are linked to metrics via the file name (it's the value of the select). So to add data, you'd make a CSV formatted like `id, y_2012, y_2013`, with y_year being each year there is data. Null values are empty (i.e. 123,,32).

The meta is pretty sloppy - some markdown that is being hand parsed with henious lefts and rights. You'll probably need to screw with it. What can I tell you, I needed *normals* to edit that stuff.

Things to customize for your data:
+ The hella select needs your metrics with the value being the CSV file to fetch.
+ The map center, zoom, and any base tiles.
+ For the D3 layer, customize the id field (the default is `id`) of the layer along with the subclass in the topojson (here it's `npa2`).
