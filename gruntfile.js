module.exports = function(grunt) {
  "use strict";

  grunt.initConfig({
    copy: {
      build: {
        files: [
          {
            expand: true,
            cwd: "./public",
            src: ["**"],
            dest: "./dist/public"
          },
          {
            expand: true,
            cwd: "./views",
            src: ["**"],
            dest: "./dist/views"
          }
        ]
      }
    },
    ts: {
      app: {
        files: [{
          src: ["app/server/src\*\*/\*.ts", "!app/server/src/.baseDir.ts"],
          dest: "./app/server/dist"
        }],
        options: {
          module: "commonjs",
          target: "es6",
          sourceMap: true,
          rootDir: "app/server/src",
          lib: ["es6", "dom"],
          types: ["reflect-metadata"],
          moduleResolution: "node",
          experimentalDecorators: true,
          emitDecoratorMetadata: true
        }
      }
    },
    watch: {
      ts: {
        files: ["app/\*\*/\*.ts"],
        tasks: ["ts"]
      },
      // views: {
      //   files: ["views/**/*.pug"],
      //   tasks: ["copy"]
      // },
      // html: {
      //   files: ["views/**/*.html"],
      //   tasks: ["copy"]
      // }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-ts");

  grunt.registerTask("default", [
    "copy",
    "ts"
  ]);

  grunt.registerTask("watcher", [
    "watch"
  ]);
};