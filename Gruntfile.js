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
                dest: 'dist',
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
        }
    });


    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', ['wiredep']);
    grunt.registerTask('build', [
        'useminPrepare',
        'concat',
       // 'cssmin:generated',
      //  'uglify:generated',
        //'filerev',
        'usemin'
    ]);


};