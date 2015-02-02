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
    path = require('path'),
    config = require('./src/scripts/config.js');


var jsMain = [
    'src/scripts/vendor/log.js',
    'bower_components/jquery/dist/jquery.js',
    'bower_components/bootstrap/js/transition.js',
    'bower_components/bootstrap/js/button.js',
    'bower_components/bootstrap/js/collapse.js',
    'bower_components/bootstrap/js/dropdown.js',
    'bower_components/bootstrap/js/tooltip.js',
    'bower_components/bootstrap/js/popover.js',
    'bower_components/d3/d3.js',
    'bower_components/leaflet/dist/leaflet.js',
    'src/scripts/vendor/Object.observe.poly.js',
    'src/scripts/vendor/jquery-ui-1.10.3.custom.min.js',
    'bower_components/chosen_v1.1.0/chosen.jquery.js',
    'src/scripts/vendor/table2CSV.js',
    'src/scripts/vendor/Chart.js',
    'bower_components/lodash/dist/lodash.underscore.js',
    'bower_components/topojson/topojson.js',
    'src/scripts/vendor/typeahead.js',
    'src/scripts/vendor/jquery-tourbus.js',
    'bower_components/jquery.scrollTo/jquery.scrollTo.js',
    'src/scripts/functions/*.js',
    'src/scripts/config.js',
    'src/scripts/metricconfig.js',
    'src/scripts/main.js'
];

var jsReport = [
    'bower_components/jquery/dist/jquery.js',
    'bower_components/bootstrap/js/button.js',
    'bower_components/leaflet/dist/leaflet.js',
    'bower_components/Leaflet.label/dist/leaflet.label.js',
    'bower_components/topojson/topojson.js',
    'bower_components/lodash/dist/lodash.underscore.js',
    'src/scripts/vendor/Chart.js',
    'src/scripts/functions/generics.js',
    'src/scripts/config.js',
    'src/scripts/metricconfig.js',
    'src/scripts/report.js'
];

// Web server
gulp.task('browser-sync', function() {
    browserSync(['./dist/**/*.css', './dist/**/*.js', './dist/**/*.html'], {
        server: {
            baseDir: "./dist"
        }
    });
});


// Less processing
gulp.task('less', function() {
    return gulp.src(['src/less/main.less', 'src/less/report.less'])
        .pipe(less())
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest('dist/css'));
});
gulp.task('less-build', function() {
    return gulp.src(['src/less/main.less', 'src/less/report.less'])
        .pipe(less())
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(minifycss())
        .pipe(gulp.dest('dist/css'));
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
gulp.task('markdown', function() {
    return gulp.src('src/data/meta/*.md')
        .pipe(markdown())
        .pipe(gulp.dest('dist/data/meta/'));
});

// CSV to JSON
gulp.task('convert', function() {
    return gulp.src('src/data/metric/*.csv')
        .pipe(convert({
            from: 'csv',
            to: 'json'
        }))
        .pipe(gulp.dest('dist/data/metric/'));
});

// merge json
gulp.task('merge-json', function() {
    return gulp.src("dist/data/metric/*.json")
        .pipe(jsoncombine("merge.json", function(data){ return new Buffer(JSON.stringify(data)); }))
        .pipe(gulp.dest("dist/data"));
});

// image processing
gulp.task('imagemin', function() {
    return gulp.src('src/images/build/*')
        .pipe(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest('dist/images'));
});

// cache busting
gulp.task('replace', function() {
    return gulp.src('src/*.html')
        .pipe(replace("{{cachebuster}}", Math.floor((Math.random() * 100000) + 1)))
        .pipe(replace("{{neighborhoodDescriptor}}", config.neighborhoodDescriptor))
        .pipe(replace("{{gaKey}}", config.gaKey))
        .pipe(gulp.dest('dist/'));
});

// watch
gulp.task('watch', function () {
    gulp.watch(['./src/*.html'], ['replace']);
    gulp.watch(['./src/less/**/*.less'], ['less']);
    gulp.watch('src/scripts/**/*.js', ['js']);
});

// rename files for basic setup
gulp.task('initSearch', function() {
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

// clean folders
gulp.task('clean', function() {
    fs.readdirSync("./dist/data/meta").forEach(function(fileName) {
        if (path.extname(fileName) === ".html") {
            fs.unlinkSync("./dist/data/meta/" + fileName);
        }
    });
    fs.readdirSync("./dist/data/metric").forEach(function(fileName) {
        if (path.extname(fileName) === ".json") {
            fs.unlinkSync("./dist/data/metric/" + fileName);
        }
    });
});


// controller tasks
gulp.task('default', ['less', 'js', 'replace', 'watch', 'browser-sync']);
gulp.task('build', ['less-build', 'js-build', 'markdown', 'convert', 'replace', 'imagemin', 'merge-json']);
gulp.task('initdata', ['markdown', 'convert']);
