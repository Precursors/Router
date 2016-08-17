'use strict'

var jsFile = './src/*.js'
var jsPath = './build'

var gulp = require('gulp')
var flatten = require('gulp-flatten')
var babel = require('gulp-babel')  // 添加转换 es6  -> es5
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')

gulp.task('default', () =>
  gulp.src(jsFile)
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(flatten())
    .pipe(rename('jarvis.router.js'))
    .pipe(gulp.dest(jsPath))
)

gulp.task('build', () =>
  gulp.src(jsFile)
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(flatten())
    .pipe(rename('jarvis.router.min.js'))
    .pipe(gulp.dest(jsPath))
)

gulp.task('watch', () =>
  gulp.watch([jsFile], ['default'])
)
