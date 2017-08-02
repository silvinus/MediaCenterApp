'use strict';

let gulp = require('gulp');
let ts = require('gulp-typescript');

let clientTsProject = ts.createProject('app/client/tsconfig.json');
let serverTsProject = ts.createProject('app/server/tsconfig.json');

// These tasks will be run when you just type "gulp"
gulp.task('default', [ 'clientscripts', 'serverscripts' ]);

// This task can be run alone with "gulp clientscripts"
gulp.task('clientscripts', () => {
  return clientTsProject.src()
                        .pipe(clientTsProject())
                        .js
                        .pipe(gulp.dest('app/client/dist'));
});

// This task can be run alone with "gulp serverscripts"
gulp.task('serverscripts', () => {
  return serverTsProject.src()
                        .pipe(serverTsProject())
                        .js
                        .pipe(gulp.dest('app/server/dist'));
});

// By adding this, we can run "gulp watch" to automatically
// run the build when we change a script
gulp.task('watch', () => {
  gulp.watch('app/client/src/**/*.ts', [ 'clientscripts' ]);
  gulp.watch('app/server/src/**/*.ts', [ 'serverscripts' ]);
});