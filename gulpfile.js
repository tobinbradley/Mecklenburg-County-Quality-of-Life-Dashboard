var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    markdown = require('gulp-markdown'),
    convert = require('gulp-convert'),
    imagemin = require('gulp-imagemin'),
    replace = require('gulp-replace'),
    jsoncombine = require("gulp-jsoncombine"),
    fs = require('fs'),
    config = require('./assets/scripts/config.js');


var jsMain = [
    'assets/scripts/vendor/log.js',
    'bower_components/jquery/dist/jquery.js',
    'bower_components/bootstrap/js/transition.js',
    'bower_components/bootstrap/js/button.js',
    'bower_components/bootstrap/js/collapse.js',
    'bower_components/bootstrap/js/dropdown.js',
    'bower_components/bootstrap/js/tooltip.js',
    'bower_components/bootstrap/js/popover.js',
    'bower_components/d3/d3.js',
    'bower_components/leaflet/dist/leaflet.js',
    'assets/scripts/vendor/Object.observe.poly.js',
    'assets/scripts/vendor/jquery-ui-1.10.3.custom.min.js',
    'bower_components/chosen_v1.1.0/chosen.jquery.js',
    'assets/scripts/vendor/table2CSV.js',
    'assets/scripts/vendor/Chart.js',
    'bower_components/lodash/dist/lodash.underscore.js',
    'bower_components/topojson/topojson.js',
    'assets/scripts/vendor/typeahead.js',
    'assets/scripts/vendor/jquery-tourbus.js',
    'bower_components/jquery.scrollTo/jquery.scrollTo.js',
    'assets/scripts/functions/*.js',
    'assets/scripts/config.js',
    'assets/scripts/metricconfig.js',
    'assets/scripts/main.js'
];

var jsReport = [
    'bower_components/jquery/dist/jquery.js',
    'bower_components/bootstrap/js/button.js',
    'bower_components/leaflet/dist/leaflet.js',
    'bower_components/Leaflet.label/dist/leaflet.label.js',
    'bower_components/topojson/topojson.js',
    'bower_components/lodash/dist/lodash.underscore.js',
    'assets/scripts/vendor/Chart.js',
    'assets/scripts/functions/generics.js',
    'assets/scripts/config.js',
    'assets/scripts/metricconfig.js',
    'assets/scripts/report.js'
];

// Web server
gulp.task('browser-sync', function() {
    browserSync(['./public/**/*.css', './public/**/*.js', './public/**/*.html'], {
        server: {
            baseDir: "./public"
        }
    });
});


// Less processing
gulp.task('less', function() {
    return gulp.src(['assets/less/main.less', 'assets/less/report.less'])
        .pipe(less())
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest('public/css'));
});
gulp.task('less-build', function() {
    return gulp.src(['assets/less/main.less', 'assets/less/report.less'])
        .pipe(less())
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(minifycss())
        .pipe(gulp.dest('public/css'));
});

// JavaScript
gulp.task('js', function() {
    gulp.src(jsMain)
        .pipe(concat('main.js'))
        .pipe(gulp.dest('public/js'));
    return gulp.src(jsReport)
        .pipe(concat('report.js'))
        .pipe(gulp.dest('public/js'));
});
gulp.task('js-build', function() {
    gulp.src(jsReport)
        .pipe(concat('report.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/js'));
    return gulp.src(jsMain)
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/js'));
});

// markdown
gulp.task('markdown', function() {
    return gulp.src('assets/data/meta/*.md')
        .pipe(markdown())
        .pipe(gulp.dest('public/data/meta/'));
});

// CSV to JSON
gulp.task('convert', function() {
    return gulp.src('assets/data/metric/*.csv')
        .pipe(convert({
            from: 'csv',
            to: 'json'
        }))
        .pipe(gulp.dest('public/data/metric/'));
});

// merge json
gulp.task('merge-json', function() {
    return gulp.src("public/data/metric/*.json")
        .pipe(jsoncombine("merge.json", function(data){ return new Buffer(JSON.stringify(data)); }))
        .pipe(gulp.dest("public/data"));
});

// image processing
gulp.task('imagemin', function() {
    return gulp.src('assets/images/build/*')
        .pipe(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest('public/images'));
});

// cache busting
gulp.task('replace', function() {
    return gulp.src('assets/*.html')
        .pipe(replace("{{cachebuster}}", Math.floor((Math.random() * 100000) + 1)))
        .pipe(replace("{{neighborhoodDescriptor}}", config.neighborhoodDescriptor))
        .pipe(replace("{{gaKey}}", config.gaKey))
        .pipe(gulp.dest('public/'));
});

// watch
gulp.task('watch', function () {
    gulp.watch(['./assets/*.html'], ['replace']);
    gulp.watch(['./assets/less/**/*.less'], ['less']);
    gulp.watch('assets/scripts/**/*.js', ['js']);
});

// rename files for basic setup
gulp.task('initSearch', function() {
    // make sure people don't run this twice and end up with no search.js
    fs.exists('assets/scripts/functions/search.js.basic', function(exists) {
        if (exists) {
            console.log("renaming search files...");
            // rename mecklenburg search file to search.js.meck
            fs.rename('assets/scripts/functions/search.js', 'assets/scripts/functions/search.js.advanced', function(err) {
                if ( err ) { console.log('ERROR: ' + err); }
            });
            // rename default search file to search.js
            fs.rename('assets/scripts/functions/search.js.basic', 'assets/scripts/functions/search.js', function(err) {
                if ( err ) { console.log('ERROR: ' + err); }
            });
        }
  });
});


// controller tasks
gulp.task('default', ['less', 'js', 'replace', 'watch', 'browser-sync']);
gulp.task('build', ['less-build', 'js-build', 'markdown', 'convert', 'replace', 'imagemin', 'merge-json']);
gulp.task('initdata', ['markdown', 'convert']);
