module.exports = (grunt) ->
  grunt.initConfig
    watch:
      app:
        files: ['lib/web/script.js']
        tasks: ['browserify:app']

      less:
        files: ['lib/web/**/*.less']
        tasks: ['less:styles']

      ctrl:
        files: ['lib/api/**/*.js']
        tasks: ['browserify:ctrl']

    concat:
      app:
        src: [
          'bower_components/ractive/ractive.js'
        ]
        dest: 'www/vendor.js'

    bower:
      install:
        options:
          copy: off
          targetDir: 'bower_components'

    less:
      styles:
        files:
          'www/styles.css': ['lib/web/styles/app.less']

    browserify:
      options:
        watch: grunt.cli.tasks.indexOf('watch') > -1

      app:
        src: 'lib/web/script.js'
        dest: 'www/bundle.js'

      ctrl:
        src: 'lib/api/control.js'
        dest: 'KeyPad.control.js'

  grunt.loadNpmTasks 'grunt-parts'
  grunt.loadNpmTasks 'grunt-bower-task'
  grunt.loadNpmTasks 'grunt-browserify'
  grunt.loadNpmTasks 'grunt-contrib-less'
  grunt.loadNpmTasks 'grunt-contrib-concat'

  grunt.registerTask 'default', ['less', 'bower', 'concat', 'browserify']
