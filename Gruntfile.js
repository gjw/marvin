module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-sass');

    grunt.initConfig({
        sass: {
            options: {
                style: 'compressed',
                sourcemap: 'none'
            },
            dist: {
                files: {
                    'lib/reporter/assets/main.min.css': 'lib/reporter/assets/scss/main.scss'
                }
            }
        }
    });

    grunt.registerTask('default', ['sass:dist']);

};