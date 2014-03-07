// Load plugins
var gulp = require('gulp'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    concat = require('gulp-concat'),
    replace = require('gulp-replace'),
    markdown = require('gulp-markdown'),
    refresh = require('gulp-livereload'),
    convert = require('gulp-convert'),
    lr = require('tiny-lr'),
    server = lr();

var jsFiles = [
    'bower_components/jquery/dist/jquery.js',
    'bower_components/bootstrap/js/modal.js',
    'bower_components/bootstrap/js/transition.js',
    'bower_components/bootstrap/js/button.js',
    'bower_components/bootstrap/js/collapse.js',
    'bower_components/bootstrap/js/dropdown.js',
    'bower_components/bootstrap/js/tooltip.js',
    'assets/scripts/vendor/leaflet/leaflet.js',
    'assets/scripts/vendor/jquery-ui-1.10.3.custom.min.js',
    'assets/scripts/vendor/chosen.jquery.js',
    'bower_components/d3/d3.js',
    'assets/scripts/vendor/pubsub.js',
    'bower_components/topojson/topojson.js',
    'assets/scripts/vendor/d3.tip.v0.6.3.js',
    'assets/scripts/vendor/typeahead.js',
    'bower_components/lodash/dist/lodash.underscore.js',
    'bower_components/jquery-joyride/jquery.cookie.js',
    'bower_components/jquery-joyride/jquery.joyride-2.0.3.js',
    'assets/scripts/vis/*.js',
    'assets/scripts/search.js',
    'assets/scripts/page.js'
];

// Less preprocessing with autoprefixer and minify
gulp.task('styles', function() {
    return gulp.src('assets/less/main.less')
        .pipe(less())
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(minifycss())
        .pipe(gulp.dest('public/css'))
        .pipe(refresh(server));
});

// Script concatenation
gulp.task('scripts', function() {
    return gulp.src(jsFiles)
        .pipe(concat('main.js'))
        .pipe(gulp.dest('public/js'))
        .pipe(refresh(server));
});

// Script uglify
gulp.task('uglify', function() {
    return gulp.src(jsFiles)
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/js'));
});

// Markdown processing
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

// Image Minification
gulp.task('imagemin', function() {
    return gulp.src('assets/images/build/*')
        .pipe(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest('public/images'));
});

// HTML refresh
gulp.task('html', function() {
    return gulp.src(['public/**/*.html'])
        .pipe(refresh(server));
});

// Image refresh
gulp.task('images', function() {
    return gulp.src(['public/**/*.png', 'public/**/*.gif', 'public/**/*.jpg', 'public/**/*.svg'])
        .pipe(refresh(server));
});

// Cache busting
gulp.task('replace', function() {
    return gulp.src('public/index.html')
        .pipe(replace(/foo=[0-9]*/g, 'foo=' + Math.floor((Math.random() * 100000) + 1)))
        .pipe(gulp.dest('public/'));
});

// live reload
gulp.task('livereload', function() {
    server.listen(35729, function(err) {
        if (err) {
            return console.log(err);
        }
    });
});

// dev task
gulp.task('dev', function() {
    gulp.run('livereload');
    gulp.watch('assets/less/**/*.less', ['styles']);
    gulp.watch('assets/scripts/**/*.js', ['scripts']);
    gulp.watch(['public/**/*.html'], ['html']);
    gulp.watch(['public/**/*.png', 'public/**/*.gif', 'public/**/*.jpg', 'public/**/*.svg'], ['images']);
});

// build task
gulp.task('build', function() {
    gulp.run('styles', 'replace', 'uglify', 'markdown', 'convert');
});
