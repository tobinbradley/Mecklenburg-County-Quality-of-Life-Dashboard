var gulp = require('gulp'),
    connect = require('gulp-connect'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    markdown = require('gulp-markdown'),
    convert = require('gulp-convert'),
    imagemin = require('gulp-imagemin'),
    replace = require('gulp-replace'),
    psi = require('psi'),
    open = require('open'),
    fs = require('fs');

var jsFiles = [
    'bower_components/jquery/dist/jquery.js',
    'bower_components/bootstrap/js/transition.js',
    'bower_components/bootstrap/js/button.js',
    'bower_components/bootstrap/js/collapse.js',
    'bower_components/bootstrap/js/dropdown.js',
    'bower_components/bootstrap/js/tooltip.js',
    'bower_components/jquery-placeholder/jquery.placeholder.js',
    'bower_components/leaflet/dist/leaflet.js',
    'assets/scripts/vendor/jquery-ui-1.10.3.custom.min.js',
    'assets/scripts/vendor/chosen.jquery.js',
    'bower_components/d3/d3.js',
    'assets/scripts/vendor/pubsub.js',
    'bower_components/topojson/topojson.js',
    'assets/scripts/vendor/typeahead.js',
    'assets/scripts/vendor/jquery-tourbus.js',
    'bower_components/lodash/dist/lodash.underscore.js',
    'bower_components/jquery.scrollTo/jquery.scrollTo.js',
    'assets/scripts/functions/*.js',
    'assets/scripts/config.js',
    'assets/scripts/main.js'
];

// livereload server
gulp.task('connect', function() {
    connect.server({
        root: 'public',
        livereload: true,
        port: 8000
    });
});

// Less processing
gulp.task('less', function() {
    return gulp.src('assets/less/main.less')
        .pipe(less())
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest('public/css'))
        .pipe(connect.reload());
});
gulp.task('less-build', function() {
    return gulp.src('assets/less/main.less')
        .pipe(less())
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(minifycss())
        .pipe(gulp.dest('public/css'));
});

// JavaScript
gulp.task('js', function() {
    return gulp.src(jsFiles)
        .pipe(concat('main.js'))
        .pipe(gulp.dest('public/js'))
        .pipe(connect.reload());
});
gulp.task('js-build', function() {
    return gulp.src(jsFiles)
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/js'));
});

// markdown
gulp.task('markdown', function() {
    return gulp.src('assets/data/meta/*.md')
        .pipe(markdown())
        .pipe(gulp.dest('public/data/meta/'))
        .pipe(connect.reload());
});

gulp.task('fonts', function() {
    return gulp.src('assets/fonts/*')
        .pipe(gulp.dest('public/fonts/'))
        .pipe(connect.reload());
});

gulp.task('geo', function() {
    // cp topo and geojson
    return gulp.src('assets/data/*json')
        .pipe(gulp.dest('public/data/'))
        .pipe(connect.reload());
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

gulp.task('static', function() {
    return gulp.src('static/*')
        .pipe(gulp.dest('public/'))
        .pipe(connect.reload());
});

// cache busting
gulp.task('cachebuster', function() {
    return gulp.src('public/**/*.html')
        .pipe(replace(/foo=[0-9]*/g, 'foo=' + Math.floor((Math.random() * 100000) + 1)))
        .pipe(gulp.dest('public/'));
});

// open broser
gulp.task("browser", function(){
    return open('http://localhost:8000');
});

// watch
gulp.task('watch', function () {
    gulp.watch(['./static/*.html'], ['static']);
    gulp.watch(['./assets/data/meta/*.md'], ['markdown']);
    gulp.watch(['./assets/less/**/*.less'], ['less']);
    gulp.watch('assets/scripts/**/*.js', ['js']);
});

// rename files for basic setup
gulp.task('init', function() {
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

// performace tests
gulp.task('psi-mobile', function (cb) {
       psi({
           nokey: 'true', // or use key: ‘YOUR_API_KEY’
           url: 'http://mcmap.org/qol',
           strategy: 'mobile'
       }, cb);
  });
// performace test
gulp.task('psi-desktop', function (cb) {
       psi({
           nokey: 'true', // or use key: ‘YOUR_API_KEY’
           url: 'http://mcmap.org/qol',
           strategy: 'desktop'
       }, cb);
  });

// controller tasks
gulp.task('default', ['less', 'js', 'watch', 'connect']);
gulp.task('build', ['less-build', 'js-build', 'markdown', 'fonts', 'convert', 'static', 'cachebuster','geo','imagemin']);
