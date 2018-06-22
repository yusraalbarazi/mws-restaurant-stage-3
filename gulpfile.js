'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var sourcemaps = require('gulp-sourcemaps');


gulp.task('default', function() {

    console.log('hello');
    browserSync.init({
        server: './dist',
        port: 8000
    });

});


gulp.task('scripts', function() {
    gulp.src('js/**/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('scripts-dist', function() {
    gulp.src('js/**/*.js')
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('copy-html', function() {
    gulp.src(['./index.html', './restaurant.html'])
        .pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', function() {
    gulp.src('img/*')
        .pipe(gulp.dest('dist/img'));
});
gulp.task('sass', function() {
    return gulp.src('./sass/**/*.scss')
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.stream());
});

gulp.task('sass:watch', function() {
    gulp.watch('./sass/**/*.scss', ['sass']);

    gulp.watch('./dist/*.html').on('change', browserSync.reload);
});

gulp.task('scripts:watch', function() {
    gulp.watch('js/**/*.js', ['scripts']);

});

gulp.task('copy-html:watch', function() {
    gulp.watch('/*.html', ['copy-html']);

});