'use strict';

let gulp = require('gulp');
let del = require('del');
let ts = require('gulp-typescript');
let sourcemaps = require('gulp-sourcemaps');
let runSequence = require('run-sequence');
let exec = require('child_process').exec;
let path = require("path")

let clientTsProject = ts.createProject('app/client/src/tsconfig.app.json');
let serverTsProject = ts.createProject('app/server/tsconfig.json');

// clean the contents of the distribution directory
gulp.task('clean', function () {
  del('app/client/dist/**/*');
  return del('app/server/dist/**/*');
});

// These tasks will be run when you just type "gulp"
gulp.task('default', [ 'clientscripts', 'serverscripts' ]);

gulp.task('install:server', done => {
  exec('npm install', { cwd: 'app/server', stdio: 'inherit' }, function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    // cb(err);
  }).on('close', done);
});

gulp.task('install:client', done => {
  exec('npm install', { cwd: 'app/client', stdio: 'inherit' }, function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    // cb(err);
  }).on('close', done);
});

// This task can be run alone with "gulp serverscripts"
gulp.task('serverscripts', () => {
  return serverTsProject.src()
  
    .pipe(sourcemaps.init())
                        .pipe(serverTsProject())
                        .js
    .pipe(sourcemaps.write({
      mapSources: (path) => path, // This affects the "sources" attribute even if it is a no-op. I don't know why.
      sourceRoot: (file) => {
        return path.relative(file.relative, path.join(file.cwd, 'src'));
      }
    }))
    .pipe(gulp.dest('app/server/dist'));
});

gulp.task('clientscripts', function (done) {
  exec('ng build', { cwd: 'app/client', stdio: 'inherit' }, function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    // cb(err);
  }).on('close', done);
})

/**
 * Install dependencies
 */
gulp.task("install", ['install:server', 'install:client'], () => {
    console.log("Building the project ...");
});

/**
 * Build the project.
 */
gulp.task("build", ['clean', 'serverscripts', 'clientscripts'], () => {
    console.log("Building the project ...");
});

// By adding this, we can run "gulp watch" to automatically
// run the build when we change a script
gulp.task('watch', () => {
  gulp.watch('app/client/src/**/*.*', [ 'clientscripts' ]);
  gulp.watch('app/server/src/**/*.*', [ 'serverscripts' ]);
});

var Config = function(g) {
  var gulp = function() {
    return g;
  }

  return {
    gulp: gulp
}
}

module.exports = new Config(gulp);