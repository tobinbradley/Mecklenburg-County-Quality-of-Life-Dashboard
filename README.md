Quality of Life Dashboard v2 Alpha
=================

A joint project between the City of Charlotte, Mecklenburg County, and UNCC. Currently in beta testing, the site is scheduled for launch on January 8, 2013. You can see the live site [here](http://maps.co.mecklenburg.nc.us/qoldashboard).

This sucker is still baking, but most things should work. The topojson is linked to data in CSV files via the `id` field. The CSV files are linked to metrics via the file name (it's the value of the select). So to add data, you'd make a CSV formatted like `id, y_2012, y_2013`, with y_year being each year there is data. Null values are not there.

The meta is pretty sloppy - some markdown that is being hand parsed. You'll probably need to screw with it. What can I tell you, I needed *normals* to edit that stuff.

Things to customize for your data:
+ The hella select needs your metrics with the value being the CSV file to fetch.
+ The map center, zoom, and any base tiles.
+ For the D3 layer, customize the id field (the default is `id`) of the layer along with the subclass in the topojson (here it's `npa2`).
