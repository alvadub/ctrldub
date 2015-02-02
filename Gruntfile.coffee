path = require('path')
JSZip = require('jszip')

module.exports = (grunt) ->
  grunt.initConfig
    watch:
      app:
        files: ['lib/web/script.js']
        tasks: ['browserify:app']

      ctrl:
        files: ['lib/api/**/*.js']
        tasks: ['browserify:ctrl']

    browserify:
      options:
        watch: grunt.cli.tasks.indexOf('watch') > -1

      app:
        src: 'lib/web/script.js'
        dest: 'bundle.js'

      ctrl:
        src: 'lib/api/control.js'
        dest: 'KeyPad.control.js'

  grunt.loadNpmTasks 'grunt-parts'
  grunt.loadNpmTasks 'grunt-browserify'

  # TODO: fix build...

  # grunt.registerTask 'build', ->
  #   assets = grunt.file.expand [
  #     'src/*.js'
  #     'package.json'
  #   ]

  #   Array::push.apply assets, [
  #     'package.json'
  #     'styles.css'
  #     'index.html'
  #     'bundle.js'
  #     'KeyPad.control.js'
  #     'bower_components/ractive/ractive.js'
  #   ]

  #   zip = new JSZip

  #   for src in assets
  #     zip.file src.replace(process.cwd(), ''), grunt.file.read(src)

  #   grunt.file.write 'KeyPad.nw', zip.generate(type: 'nodebuffer')

  #   grunt.log.ok 'Done.'
