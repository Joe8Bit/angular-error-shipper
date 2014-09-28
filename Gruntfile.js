module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    pkg: grunt.file.readJSON('./bower.json'),
    build_dir: 'dist',

    lib_files: {
      core: [
        'src/angular-error-shipper.js'
      ],
      test: ['test/**/*.js']
    },

    concat: {
      core: {
        src: ['<%= lib_files.core %>'],
        dest: '<%= build_dir %>/angular-error-shipper.js'
      }
    },

    uglify: {
      core: {
        files: {
          '<%= build_dir %>/angular-error-shipper.min.js': '<%= concat.core.dest %>'
        }
      }
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },

    ngmin: {
      core: {
        src: '<%= concat.core.dest %>',
        dest: '<%= concat.core.dest %>'
      }
    }

  });

  grunt.registerTask('default', ['test']);
  grunt.registerTask('test', ['karma:unit']);

  grunt.registerTask('build', [
    'concat:core',
    'ngmin:core',
    'uglify:core'
  ]);
};