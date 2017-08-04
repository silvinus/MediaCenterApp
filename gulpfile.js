'use strict';

let gulp = require('gulp');
let del = require('del');
let ts = require('gulp-typescript');
let sourcemaps = require('gulp-sourcemaps');

let clientTsProject = ts.createProject('app/client/src/tsconfig.app.json');
let serverTsProject = ts.createProject('app/server/tsconfig.json');

// clean the contents of the distribution directory
gulp.task('clean', function () {
  return del('app/[client|server]/dist/**/*');
});

// These tasks will be run when you just type "gulp"
gulp.task('default', [ 'clientscripts', 'serverscripts' ]);

// This task can be run alone with "gulp clientscripts"
gulp.task('clientscripts', () => {
  return clientTsProject.src()
                        .pipe(clientTsProject())
                        .pipe(sourcemaps.init()) 
                        .js
                        .pipe(sourcemaps.write('.'))
                        .pipe(gulp.dest('app/client/dist'));
});

// This task can be run alone with "gulp serverscripts"
gulp.task('serverscripts', () => {
  return serverTsProject.src()
                        .pipe(serverTsProject())
                        .js
                        .pipe(gulp.dest('app/server/dist'));
});

/**
 * Copy all resources that are not TypeScript files into build directory.
 */
gulp.task("copy:assets", () => {
    return gulp.src(["app/client/src/**/*", "!**/*.ts", "!**/*.json", "**/*.gitkeep"])
        .pipe(gulp.dest("app/client/dist"));
});

// copy dependencies
gulp.task('copy:libs', ['clean'], function() {
  return gulp.src([
      'node_modules/angular2/bundles/angular2-polyfills.js',
      'node_modules/systemjs/dist/system.src.js',
      'node_modules/rxjs/bundles/Rx.js',
      'node_modules/angular2/bundles/angular2.dev.js',
      'node_modules/angular2/bundles/router.dev.js'
    ])
    .pipe(gulp.dest('dist/lib'))
});

/**
 * Build the project.
 */
gulp.task("build", ['clean', 'serverscripts', 'clientscripts', 'resources'], () => {
    console.log("Building the project ...");
});

// By adding this, we can run "gulp watch" to automatically
// run the build when we change a script
gulp.task('watch', () => {
  gulp.watch('app/client/src/**/*.ts', [ 'clientscripts' ]);
  gulp.watch('app/server/src/**/*.ts', [ 'serverscripts' ]);
});