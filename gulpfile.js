// @ts-nocheck
var gulp = require('gulp')
var ts = require('gulp-typescript')
var tslint = require('gulp-tslint')

const tsProject = ts.createProject('tsconfig.json')

gulp.task('build', function (done) {
  gulp
    .src('src/**/*.ts')
    .pipe(tsProject())
    .pipe(gulp.dest('dist'))

  done()
})

gulp.task('tslint', function (done) {
  gulp
    .src('src/**/*.ts')
    .pipe(tslint())
    .pipe(tslint.report())

  done()
})

gulp.task('dev', function (done) {
  gulp.watch('src/**/*.ts', gulp.series('build', 'tslint'))

  done()
})

gulp.task(
  'default',
  gulp.series('build', 'tslint', function (done) {
    // do more stuff
    done()
  })
)
