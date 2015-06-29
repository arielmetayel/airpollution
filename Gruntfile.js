module.exports = function (grunt) {

    grunt.initConfig({
        wiredep: {
            task: {
                src: ['src/**/*.html']

            }
        },
        useminPrepare: {
            html: 'src/index.html',
            options: {
                dest: '.',
                flow: {
                    html: {
                        steps: {
                            js: ['concat'],
                            css: ['cssmin']
                        },
                        post: {}
                    }
                }
            }
        },
        uglify: {
            generated: {
                sourceMap: true,
                sourceMapIn: function(file) {
                    return file + ".map"
                },
                files: [
                    {
                        src: [ 'dist/scripts/vendor.js' ],
                        dest: 'dist/scripts/vendor.js'
                    },{
                        src: [ 'dist/scripts/main.js' ],
                        dest: 'dist/scripts/main.js'
                    }
                ]
            }
        },

        usemin: {
            html: ['dist/{,*/}*.html'],
            css: ['dist/styles/{,*/}*.css'],
            options: {
                assetsDirs: [
                    'dist',
                    'dist/images',
                    'dist/styles'
                ]
            }
        },
        concat: {
            options: {
                sourceMap: true
            },
            generated: {
            }
        }
    });


    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', ['wiredep']);
    grunt.registerTask('build', [
        'useminPrepare',
        'concat:generated',
        'cssmin:generated',
        'uglify:generated',
        //'filerev',
        'usemin'
    ]);


};