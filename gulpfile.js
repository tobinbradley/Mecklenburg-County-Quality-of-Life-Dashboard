var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    markdown = require('gulp-markdown'),
    convert = require('gulp-convert'),
    imagemin = require('gulp-imagemin'),
    changed    = require('gulp-changed'),
    replace = require('gulp-replace'),
    jsoncombine = require("gulp-jsoncombine"),
    jsonmin = require('gulp-jsonmin'),
    gutil = require('gulp-util'),
    fs = require('fs'),
    del = require('del'),
    swig = require('gulp-swig'),
    data = require('gulp-data'),
    postcss = require("gulp-postcss"),
    cssnext = require("postcss-cssnext"),
    nesting = require("postcss-nesting"),
    atImport = require("postcss-import"),
    nano = require('gulp-cssnano'),
    sourcemaps = require("gulp-sourcemaps"),
    _ = require('lodash');


var jsMain = [
    'node_modules/jquery/dist/jquery.js',
    'node_modules/bootstrap/js/transition.js',
    'node_modules/bootstrap/js/button.js',
    'node_modules/bootstrap/js/collapse.js',
    'node_modules/bootstrap/js/dropdown.js',
    'node_modules/bootstrap/js/tooltip.js',
    'node_modules/bootstrap/js/popover.js',
    'node_modules/d3/d3.js',
    'node_modules/leaflet/dist/leaflet.js',
    'node_modules/leaflet.locatecontrol/src/L.Control.Locate.js',
    'node_modules/jquery.scrollto/jquery.scrollTo.js',
    'node_modules/underscore/underscore.js',
    'node_modules/topojson/build/topojson.js',
    'node_modules/leaflet-easybutton/src/easy-button.js',
    'src/scripts/vendor/Object.observe.poly.js',
    'src/scripts/vendor/jquery-ui-1.10.3.custom.min.js',
    'src/scripts/vendor/table2CSV.js',
    'src/scripts/vendor/Chart.js',
    'src/scripts/vendor/typeahead.js',
    'src/scripts/vendor/jquery-tourbus.js',
    'src/scripts/vendor/jenks.js',
    'src/scripts/functions/calculations/*.js',
    'src/scripts/functions/*.js',
    'data/config/config.js',
    'src/scripts/main.js'
];

var jsReport = [
    'node_modules/jquery/dist/jquery.js',
    'node_modules/bootstrap/js/button.js',
    'node_modules/leaflet/dist/leaflet.js',
    'node_modules/leaflet-label/dist/leaflet.label.js',
    'node_modules/topojson/build/topojson.js',
    'node_modules/underscore/underscore.js',
    'src/scripts/vendor/Chart.js',
    'src/scripts/functions/calculations/*.js',
    'src/scripts/functions/generics.js',
    'src/scripts/functions/calculations.js',
    'data/config/config.js',
    'src/scripts/report.js'
];


// Unit tests
gulp.task('test-build', function() {
    return gulp.src(_.without(jsMain, 'src/scripts/main.js'))
        .pipe(concat('app.js'))
        .pipe(gulp.dest('src/tests'));
});
gulp.task('qunit', function() {
    // fire up qunit page
    browserSync(['./src/tests/*.*'], {
        server: {
            baseDir: "./src/tests"
        }
    });
});

// Web server
gulp.task('browser-sync', function() {
    browserSync(['./dist/**/*.css', './dist/**/*.js', './dist/**/*.html'], {
        server: {
            baseDir: "./dist"
        }
    });
});


// CSS
gulp.task("css", function() {
    var processors = [
        atImport,
        cssnext({
            'browers': ['last 2 version'],
            'customProperties': true,
            'colorFunction': true,
            'customSelectors': true
        })
    ];
    return gulp.src(['src/css/report.css', 'src/css/main.css'])
        .pipe(sourcemaps.init())
        .pipe(postcss(processors))
        .pipe(gutil.env.type === 'production' ? nano() : gutil.noop())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/css'));
});


// JavaScript
gulp.task('js', function() {
    gulp.src(jsMain)
        .pipe(concat('main.js'))
        .pipe(gulp.dest('dist/js'));
    return gulp.src(jsReport)
        .pipe(concat('report.js'))
        .pipe(gulp.dest('dist/js'));
});
gulp.task('js-build', function() {
    gulp.src(jsReport)
        .pipe(concat('report.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
    return gulp.src(jsMain)
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

// markdown
gulp.task('markdown', ['clean'], function() {
    return gulp.src('data/meta/*.md')
        .pipe(markdown())
        .pipe(gulp.dest('dist/data/meta/'));
});

// CSV to JSON
gulp.task('convert', ['clean'], function() {
    return gulp.src('data/metric/*.csv')
        .pipe(convert({
            from: 'csv',
            to: 'json'
        }))
        .pipe(jsonmin())
        .pipe(gulp.dest('tmp/'));
});

// merge json
gulp.task('merge-json', ['clean', 'convert'], function() {
    return gulp.src("tmp/*.json")
        .pipe(jsoncombine("merge.json", function(data){ return new Buffer(JSON.stringify(data)); }))
        .pipe(jsonmin())
        .pipe(gulp.dest("dist/data"));
});

// image processing
gulp.task('imagemin', function() {
    return gulp.src('src/images/build/*')
        .pipe(changed('dist/images'))
        .pipe(imagemin({
            optimizationLevel: 5,
            svgoPlugins: [{removeViewBox: false}]
        }))
        .pipe(gulp.dest('dist/images'));
});

// Compile templates
gulp.task('compile-templates', function() {
    var getJsonData = function(file) {
        return require('./data/config/site.json');
    };
    var config = require('./data/config/config.js');
    return gulp.src(['src/*.html', '!src/layout.html'])
        .pipe(data(getJsonData))
        .pipe(swig({
            data: {
                cachebuster: Math.floor((Math.random() * 100000) + 1),
                custom_geography: config.customGeography
            }
        }))
        .pipe(gulp.dest('dist/'));
});

// Copy over base geography files and humans.txt from src to dist
gulp.task('copy-misc-files', function() {
    gulp.src('data/*.*')
        .pipe(gulp.dest('dist/data/'));
    gulp.src('src/humans.txt')
        .pipe(gulp.dest('dist/'));
    gulp.src('src/fonts/*.*')
        .pipe(gulp.dest('dist/fonts/'));
    gulp.src('src/downloads/*.*')
        .pipe(gulp.dest('dist/downloads/'));
});

gulp.task('world_files', ['clean', 'convert'], function() {
  var config = require('./data/config/config.js');
  _.each(config.metricConfig, function(m) {
    var data = {};
    // grab necessary files and calculate
    if (m.type === "sum") {
        var raw = require('./tmp/r' + m.metric + '.json');
        var keys = _.keys(raw[0]);
        keys.shift();
        _.each(keys, function(year) {
          var arr = raw.map(function(el) { return el[year]; }).map(Number);
          var sum = arr.reduce(function(previousValue, currentValue, currentIndex, array) {
                      return previousValue + currentValue;
                    });
          data[year] = sum;
        });
    }
    if (m.type === "mean") {
        var normalized = require('./tmp/n' + m.metric + '.json');
        var keys = _.keys(normalized[0]);
        keys.shift();
        _.each(keys, function(year) {
          var arr = raw.map(function(el) { return el[year]; }).map(Number);
          var mean = arr.reduce(function(previousValue, currentValue, currentIndex, array) {
                      return previousValue + currentValue;
                    });
          data[year] = mean / raw.length;
        });
    }
    if (m.type === "weighted") {
        var raw = require('./tmp/r' + m.metric + '.json');
        var denom = require('./tmp/d' + m.metric + '.json');
        var keys = _.keys(raw[0]);
        keys.shift();
        _.each(keys, function(year) {
          var arr1 = raw.map(function(el) { if (!isNaN(el[year])) return el[year]; }).map(Number);
          var arr2 = denom.map(function(el) { if (!isNaN(el[year])) return el[year]; }).map(Number);
          var theRaw = arr1.reduce(function(previousValue, currentValue, currentIndex, array) {
                      return previousValue + currentValue;
                    });
          var theDenom = arr2.reduce(function(previousValue, currentValue, currentIndex, array) {
                      return previousValue + currentValue;
                    });
          data[year] = theRaw / theDenom;
        });
        //console.log(m.metric, data);
    }

    //console.log(keys);

    // write to tmp/mXX-world file
    fs.writeFile('tmp/m' + m.metric + '-world.json', JSON.stringify(data), function(err) {
      if(err) {
        return console.log(err);
      }
    });

  });
});

// wrap files
gulp.task('jsonwrapper', ['clean', 'convert'], function() {
    var config = require('./data/config/config.js');

    _.each(config.metricConfig, function(m) {
        var fileList = [];
        if (m.type === "sum") {
            fileList.push('tmp/r' + m.metric + '.json');
        }
        if (m.type === "mean") {
            fileList.push('tmp/n' + m.metric + '.json');
        }
        if (m.type === "weighted") {
            fileList.push('tmp/r' + m.metric + '.json');
            fileList.push('tmp/d' + m.metric + '.json');
        }
        if (m.accuracy) {
            fileList.push('tmp/m' + m.metric + '-accuracy.json');
        }
        // push world values, breaks
        //fileList.push('tmp/m' + m.metric + '-world.json');

        return gulp.src(fileList)
            .pipe(jsoncombine("m" + m.metric + ".json", function(data){ return new Buffer(JSON.stringify(data)); }))
            .pipe(jsonmin())
            .pipe(gulp.dest("dist/data/metric"));
    });
});

// watch
gulp.task('watch', function () {
    gulp.watch(['./src/*.html', './data/config/*.json'], ['compile-templates']);
    gulp.watch(['./src/css/**/*.css'], ['css']);
    gulp.watch('src/scripts/**/*.js', ['js', 'test-build']);
});

// rename files for basic setup
gulp.task('init', function() {
    // make sure people don't run this twice and end up with no search.js
    fs.exists('src/scripts/functions/search.js.basic', function(exists) {
        if (exists) {
            console.log("renaming search files...");
            // rename mecklenburg search file to search.js.meck
            fs.rename('src/scripts/functions/search.js', 'src/scripts/functions/search.js.advanced', function(err) {
                if ( err ) { console.log('ERROR: ' + err); }
            });
            // rename default search file to search.js
            fs.rename('src/scripts/functions/search.js.basic', 'src/scripts/functions/search.js', function(err) {
                if ( err ) { console.log('ERROR: ' + err); }
            });
        }
  });
});

// clean junk before build
gulp.task('clean', function(cb) {
    del([
    'dist/data/meta/*.html',
    'dist/data/metric/*.json',
    'dist/data/merge.json',
    'tmp/*.json'
  ], cb);
});

// clean data out for new location
gulp.task('clean-data', function(cb) {
    del([
    'data/meta/*.md',
    'data/metric/*.csv',
    'dist/data/geography.topo.json'
  ], cb);
});


// controller tasks
gulp.task('default', ['css', 'js', 'compile-templates', 'watch', 'browser-sync']);
gulp.task('build', ['css', 'js-build', 'compile-templates', 'imagemin', 'copy-misc-files']);
gulp.task('datagen', ['clean', 'markdown', 'convert', 'jsonwrapper', 'merge-json', 'copy-misc-files']);
gulp.task('test', ['test-build', 'qunit', 'watch']);
