path = require('path')
JSZip = require('jszip')

module.exports = (grunt) ->
  grunt.registerTask 'default', ->
    assets = [
      'package.json'
      'styles.css'
      'index.html'
      'Setup.js'
      'Command.js'
      'Utils.js'
      'Actions.js'
      'Mappings.js'
      'KeyPad.js'
      'KeyPad.control.js'
      'bower_components/ractive/ractive.js'
    ]

    zip = new JSZip

    for src in assets
      zip.file src.replace(process.cwd(), ''), grunt.file.read(src)

    grunt.file.write 'KeyPad.nw', zip.generate(type: 'nodebuffer')

    grunt.log.ok 'Done.'
