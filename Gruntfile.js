module.exports = function (grunt) {
    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-autoprefixer');
    //grunt.loadNpmTasks('grunt-contrib-imagemin');

    // Default task(s).
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('build', ['less:production', 'autoprefixer', 'uglify:production', 'replace']);

    // javascript stack
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

    grunt.initConfig({
        concat: {
            development: {
                src: jsFiles,
                dest: 'public/js/main.js'
            }
        },
        uglify: {
            production: {
                options: {
                    report: 'min',
                },
                files: {
                    'public/js/main.js': jsFiles
                }
            }
        },
        less: {
            development: {
                options: {
                    sourceMap: false
                },
                files: {
                    "public/css/main.css": "assets/less/main.less"
                }
            },
            production: {
                options: {
                    yuicompress: true
                },
                files: {
                    "public/css/main.css": "assets/less/main.less"
                }
            }
        },
        autoprefixer: {
            options: {
                browsers: ['last 2 version', "> 5%", 'ie 8']
            },
            single_file: {
                src: 'public/css/main.css',
                dest: 'public/css/main.css'
            }
        },
        watch: {
            options: {
                spawn: true,
                livereload: false
            },
            grunt: {
                files: ['Gruntfile.js']
            },
            less: {
                files: ['assets/less/*.less'],
                tasks: ['less:development'],
            },
            asset_javascript: {
                files: ['assets/**/*.js'],
                tasks: ['concat:development'],
            },
            reload: {
                files: ['public/js/*.js', 'public/*.html'],
                options: {
                    livereload: true
                }
            },
            css: {
                files: ['public/css/*.css'],
                options: {
                    livereload: true
                }
            }
        },
        replace: {
            foo: {
                src: ['public/index.html'],
                overwrite: true,
                replacements: [{
                    from: /\?foo=[0-9]*/g,
                    to: function () {
                        var cacheBuster = Math.floor((Math.random() * 100000) + 1);
                        return '?foo=' + cacheBuster;
                    }
                }]
            }
        }
    });

};
