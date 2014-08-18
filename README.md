Quality of Life Dashboard v2 Beta
=================

A joint project between the City of Charlotte, Mecklenburg County, and UNCC. A reasonably up-to-date version of this dev branch is [here](http://mcmap.org/qol/). The current site site launched in January 2013 and is over [here](http://maps.co.mecklenburg.nc.us/qoldashboard). There's no launch date for the next release yet, but sometime toward the end of this year should do it. You can see what I'm banging on at [Trello](https://trello.com/b/GxsdKVUl/quality-of-life-dashboard).

The new project uses D3 for visualizations. The good news is besides all the cool features in the new version has it is less than half the size over the wire and loads over twice as fast. The bad news is IE8 absolutely will not work. I'm sorry/you're welcome.

We hope you find this project useful. Patches are always welcome!

Here's a handy [YouTube Tutorial](https://www.youtube.com/watch?v=qmx2mZXeHZQ) on customizing the Dashboard for your area of interest if reading isn't your bag.

## Project Layout
The good news about the new Dashboard release is setting up a site for you locality is much easier. The backend has been totally redesigned to easily handle adding data and customizing the app.

<div style="float: left; margin-right: 10px;">
    <img src="http://i.imgur.com/LwcIEuy.png" alt="Your alt text" title="Title"/>
</div>

First let's take a look at how the project is laid out.

The root folder has the gulp, npm, and bower configuration along with `.jshintrc` and `.editorconfig` should you use those tools.

The `assets` folder contains everything you'll work on to build your dashboard, including the metric data, images, styles (less), HTML pages, and scripts. Images in `assets\images\build` are optimized into `public\images\`

Ignore `bower_components` and `node_modules` - those are for bower and nodejs to worry about.

The `public` folder contains your processed site - concatenated and uglified JavaScript, preprocessed, auto-prefixed, and minified CSS, your processed data, etc. The only things you'll want to edit directly here are the `data\geography.topo.json` file (i.e. replace it) and optionally `humans.txt`.

<div style="clear: both"></div>

Now that you have a feel for where everything is, here are the steps you'll need to follow to build your own dashboard:

## Setting Up

### Install nodejs
Installing [nodejs](http://nodejs.org/) is a piece of cake. On Windows, download the install file and click Next until it stops asking you to click Next. On MacOS I have no idea, but there's probably a draggy-droppy involved. Any Linux distro will have nodejs in its repos, so do a `sudo pacman -S nodejs` or `sudo apt-get install nodejs` or whatever package management magic you system employs.

To make sure everything went well here, when you're done installing pull up a terminal (that's DOS for you Windows types) and type `node --version`. You should get some like `v0.10.28`.

### Install topojson, gulp and bower
I'm using [gulp](http://gulpjs.com/) as the build/dev system, because awesome. We'll be using [topojson](https://github.com/mbostock/topojson) to encode our geography. [Bower](http://bower.io/) is being used to manage JavaScript dependencies. To install them, head to a terminal and type:

    npm install -g gulp topojson bower

On Linux you'll need to sudo/run as root. On Windows, you'll need to have a compilation environment to install topojson. That means Visual Studio C++ for Windows Desktop (the free [Express](http://www.microsoft.com/en-us/download/details.aspx?id=40787) version works fine). And then you'll need to tell node what VS C++ version to use.

    npm install -g topojson --msvs_version=2013

With the version being whatever you have installed. You can get more info on the kind of stuff you'll need to compile on Windows [here](https://github.com/TooTallNate/node-gyp). Yay Windows.

### Clone or download/unzip the project
If you have git installed, just:

    git clone https://github.com/tobinbradley/Mecklenburg-County-Quality-of-Life-Dashboard.git whatever-you-want-to-call-it
    cd whatever-you-called-it
    git checkout dev

If you don't have git installed, grab [the zip file](https://github.com/tobinbradley/Mecklenburg-County-Quality-of-Life-Dashboard/archive/dev.zip) and unzip it someplace.

### Install the project's nodejs and bower dependencies
We need to install our gulp extensions and some required JavaScript libraries are handled by bower. Those dependencies are specified in package.json and bower.json respectively. *Note you need to run these commands in the root of the project folder.*

    npm install
    bower install
    gulp init

### Fire it up!
Gulp is configured with its own web server complete with livereload for development, so when you change the code your browser will automatically refresh. To start the development environment, just type:

    gulp

*Note you need to run this command in the root of the project folder.*

## Customize the Dashboard for your area
Data in the dashboard comes in three pieces:

<div style="text-align: center">
<img src="http://i.imgur.com/1IP7faT.png" style="max-width: 100%">
</div>

* Your neighborhood geography, which will be stored in topojson. It has one attribute: the neighborhood id.
* Your metric data, with each metric being stored in a CSV file. This file has a neighborhood id attribute and a column for each year of data in the format `y_<year>`. You can have as many or as few years as you have. If only one year is available, the time slider and trend chart will automatically hide. Null values should be empty, as in `<id>,12,,14`.
* The metric metadata, with each metric metadata being stored in a markdown file *with a particular format*. More about that in a minute.

### Topojson
The first thing you'll need to do is convert your neighborhood layer to topojson. There are a lot of options during conversion, which you can peruse [here](https://github.com/mbostock/topojson/wiki/Command-Line-Reference). You should start out with an Esri shapefile or geojson file. The file will need to be in WGS84 (EPSG:4326). You can use [ogr2ogr](http://www.gdal.org/ogr2ogr.html) to project a shapefile or, if the command line isn't your bag, I highly recommend [QGIS](http://www.qgis.org/).

From there the process of making the topojson file is easy. You can look through all of the options if you wish, but here's what I did:

    topojson -o geography.topo.json -s 7e-11 --id-property=id_field your_shapefile.shp

With `id_field` being the field in the shapefile you want to use for your neighborhood identifier. Copy that file into `public/data`. Make note of what your shapefile was named - you'll need that information when you update `config.js` as explained under *Final Touches*.

### Metrics
Now for a metric. You can name the metric file whatever you want; I'm doing them as `m1, m2`, but it isn't very important. Each metric file is described as above, and if that isn't clear check one out in `assets/data/metric`.

Having the metrics as CSV files gives us some of benefits. First, I'm working with a lot of non-technical people on the data, and CSV's are extremely easy for them to handle. Second, separating each metric into its own file makes adding new data and years a snap. Adding a new metric or year is just adding or updating a couple of files. But it if makes you less queasy, it gets preprocessed into JSON on build.

After you add a metric, run `gulp build` to process it into the public folder.

### Metadata
Metadata files are named *with the same name* as the metric files they correspond with. So if my metric file is `m1.csv`, my metadata file is `m1.md`. They are written in Markdown syntax and are preprocessed into HTML on build.

The easiest thing to do is take a look at the markdown files in `assets/data/meta` and take a look at what they look like. Editing markdown is a piece of cake for non-technical users, and our folks like to monkey with the metadata *almost daily*.

Now here comes the bummer. Because I'm splitting the metadata into three buckets on the app, there is some ugly lefty-righty crap going on in the code to make that happen. Because of that, if you want to format the metadata differently, you must edit `assets/scripts/functions/metadata.js` to meet your needs. It won't be hard, but not doing it will lead to disappointment.

After you add metadata, run `gulp build` to process it into the public folder.

### Customize config.js
`assets/scripts/config.js` has a number of knobs you will need to turn to set up the dashboard for your area. These are things like the geographic starting point and zoom level, the name of the neighborhoods in your topojson file, unit types for metrics, metrics that may have raw data or accuracy data associated with them, and a few other odds and ends.

### Edit index.html
Once you have your topojson, a metric, and metadata, head into `assets/index.html`. You'll see an enormous select control with an id of `metric` at line ~95. Here you'll put in your metric as an option. So if your metric was named `m1.csv`, your option would look like:

    <option value="m1">
        Whatever you're calling this sucker
    </option>

You can put metrics in optgroups as well - they'll appear as headings in the dropdown and are searchable. You'll eventually want to change the title, links, etc. here before you go into production.

### Edit report.html
Bad news: the report is so customized that it isn't practical to make one that'll automatically work with anything. Good news: customizing it won't be too hard. You can do it all in HTML (*probably*).

Take a gander at `assets/report.html`. Each report page is a div with a page class.

    <div class="page">
      ...
    </div>

It's set up for screen to show a nice report-like layout, but the margins and whatnot will disappear for printing. Neat.

Table rows are set up with classes to tell the JavaScript what it wants. Like so:

    <tr>
        <td class="m1-label">Population</td>
        <td class='text-right' data-metric='m1'></td>
        <td class='text-right' data-change='m1'></td>
        <td class='text-right' data-average='m1'></td>
    </tr>

* `data-metric` property will will be populated with the metric value, averaging if more than one neighborhood is selected.
* `data-change` property will be populated with change from the first recorded year to the last for that metric.
* `data-average` holds the global neighborhood average for that metric.
* Your metric label will be held by the `td` with the class `<metric>-label`. It'll pull from there to populate chart legends.

I made a little JavaScript helper function you can see in report.js that pulls out options from index.html and makes a table based on the optgroup. So if you have an optgroup for "Character", you can pull out the table contents in your browser console via:

    var text = "";
    $("optgroup[label='Economics'] option").each(function() {
        var label = $(this).prop("label");
        var m = $(this).val();
        text += "<tr><td class='" + m + "-label'>" + label + "</td><td class='text-right' data-metric='" + m + "'></td><td class='text-right' data-change='" + m + "'></td><td class='text-right' data-average='" + m + "'></td></tr>";
    });
    console.log(text);

You'll want to pretty that HTML. If your editor doesn't have a HTML pretty plugin, you need a new editor.

Charts are marked up like so:

    <canvas id="chart-character-1" class="chart-doughnut" data-chart="m7,m8,m9,m10" width="150" height="150"></canvas>
    <div id="chart-character-1-legend"></div>

I'm using [Chart.js](http://www.chartjs.org/) for charts. Because there'll be a number of them and they don't need any interactivity/updating, drawing charts via bitmap (canvas) is a much more efficient way to go.

Each chart (`canvas` tag) will need a unique ID (anything will do). The properties are:

* `class` contains the type of chart to draw.
* `data-chart` has a comma delimited list of metrics to draw.

The `div` below it will contain the legend. Give it *the same id as the chart* with `-legend`, like `<what-you-called-the-chart>-legend`.

Bob's your uncle, you have a report. Note the report is stand-alone, taking neighborhood arguments in the URL. You can statically link neighborhood(s) to the report and bypass the dashboard entirely. You should print preview in a few browsers to make sure you're not over-running pages or otherwise embarrassed yourself.

## Build for deployment
Building for deployment does all of the niceties for you - JavaScript concatenation and minification, LESS preprocessing/auto-prefixing/minification, Markdown conversion, CSV to JSON conversion, image optimzation, and cache busting. From the root folder run:

    gulp build

*Note you need to run this command in the root of the project folder.*

Copy the contents of your public folder to your production web server and you're good to go.
