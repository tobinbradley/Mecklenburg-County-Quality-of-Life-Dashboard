// Load plugins
var gulp = require('gulp'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    concat = require('gulp-concat'),
    replace = require('gulp-replace'),
    refresh = require('gulp-livereload'),
    lr = require('tiny-lr'),
    server = lr();

var jsFiles = [
    'assets/scripts/vendor/jquery-2.0.3.min.js',
    'assets/scripts/vendor/bootstrap/modal.js',
    'assets/scripts/vendor/bootstrap/transition.js',
    'assets/scripts/vendor/bootstrap/button.js',
    'assets/scripts/vendor/bootstrap/collapse.js',
    'assets/scripts/vendor/bootstrap/dropdown.js',
    'assets/scripts/vendor/bootstrap/tooltip.js',
    'assets/scripts/vendor/leaflet/leaflet.js',
    'assets/scripts/vendor/leaflet/leaflet.d3.js',
    'assets/scripts/vendor/jquery-ui-1.10.3.custom.min.js',
    'assets/scripts/vendor/chosen.jquery.js',
    'assets/scripts/vendor/d3.v3.js',
    'assets/scripts/vendor/pagedown.js',
    'assets/scripts/vendor/pubsub.js',
    'assets/scripts/vendor/queue.v1.min.js',
    'assets/scripts/vendor/topojson.v0.js',
    'assets/scripts/vendor/d3.tip.v0.6.3.js',
    'assets/scripts/vendor/typeahead.js',
    'assets/scripts/vendor/underscore-min.js',
    'assets/scripts/vis/*.js',
    'assets/scripts/datameta.js',
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
    return gulp.src('public/js/main.js')
        .pipe(uglify())
        .pipe(gulp.dest('public/js'));
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
    gulp.run('replace', 'imagemin', 'uglify');
});
