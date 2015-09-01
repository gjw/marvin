module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');

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
        },
        watch: {
          css: {
            files: '**/*.scss',
            tasks: ['sass:dist']
          },
        },
    });

    grunt.registerTask('default', ['sass:dist', 'watch']);

};
