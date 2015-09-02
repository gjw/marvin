module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-spritesmith');

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
        sprite: {
            icons: {
                src: './graphics/browsers/*.png',
                dest: './lib/reporter/assets/images/browsers.png',
                destCss: './lib/reporter/assets/scss/partials/_browsers.scss',
                imgPath: '../assets/images/browsers.png',
                algorithm: 'binary-tree',
                engine: 'pngsmith',
                cssTemplate: './lib/reporter/assets/scss/sprite-template.mustache',
                cssFormat: 'scss'
            }
        },
        watch: {
          css: {
            files: '**/*.scss',
            tasks: ['sass:dist']
          },
        },
    });

    grunt.registerTask('default', ['sprite:icons', 'sass:dist', 'watch']);

};
