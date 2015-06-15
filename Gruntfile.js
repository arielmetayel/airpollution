module.exports = function (grunt) {

    grunt.initConfig({
        wiredep: {

            task: {
                src: ['src/**/*.html']

            }
        }
    });

    grunt.loadNpmTasks('grunt-wiredep');

    grunt.registerTask('default', ['wiredep']);


};