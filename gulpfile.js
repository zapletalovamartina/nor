/* *********************************************************************************************************************
 * Gulp file.                                                                                                         **
 *                                                                                                                    **
 * Date: 2016-07-21 14:50:37                                                                                          **
 * Author: Martin Urbánek <martin.urbanek@storytlrs.cz>                                                               **
 * ****************************************************************************************************************** */

/* ################################################################################################################## */

'use strict';

var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var plugins = gulpLoadPlugins();
var lost = require('lost');
var autoprefixer = require('autoprefixer');
var argv = require('yargs').argv;
var imagemin = require('gulp-imagemin');
var imageminMozjpeg = require('imagemin-mozjpeg');
var imageminSvgo = require('imagemin-svgo');
var fileinclude = require('gulp-file-include');
var path = require("path");
var rename = require('gulp-rename');

var paths = {
    css: {
        src: 'src/scss/main.scss',
        dest: 'build/css/',
        watch: 'src/scss/**/*.scss',
    },
    js: {
        src: '',
        dest: ''
    },
    img: {
        src: '',
        dest: ''
    },
    tpl : {
        src: 'src/tpl/**/',
        dest: 'build/'
    }
};

gulp.task('fileinclude', function() {
  return  gulp.src(path.join(paths.tpl.src, '*.tpl.html'))
    .pipe(fileinclude())
    .pipe(rename({
      extname: ""
     }))
    .pipe(rename({
      extname: ".html"
     }))
    .pipe(gulp.dest(paths.tpl.dest))
    .pipe(plugins.livereload())
});

gulp.task('css', function () {
    var output = 'main.css';

    return gulp.src(paths.css.src)
        .pipe(plugins.if(!argv.production, plugins.sourcemaps.init()))
        .pipe(plugins.concat(output))
        .pipe(plugins.sass({
            outputStyle: 'expanded'
        }).on('error', plugins.sass.logError))
        .pipe(plugins.postcss([
            lost(),
            autoprefixer('last 2 versions', 'ie 9')
        ]))
        .pipe(plugins.if(!argv.production, plugins.sourcemaps.write()))
        .on('error', plugins.notify.onError("Error: <%= error.file %> <%= error.message %>"))
        .pipe(plugins.if(argv.production, plugins.minifyCss()))
        .pipe(gulp.dest(paths.css.dest))
        .pipe(plugins.livereload());
});

gulp.task('js', function () {
    var output = 'main.js';
    return gulp.src([
            'web/themes/custom/fsv_uk/src/js/main.js',
        ])
        .pipe(plugins.if(!argv.production, plugins.sourcemaps.init()))
        .pipe(plugins.concat(output))
        // .pipe(plugins.if(!argv.production, plugins.jshint()))
        // .pipe(plugins.if(!argv.production, plugins.jshint.reporter('jshint-stylish')))
        .pipe(plugins.if(!argv.production, plugins.sourcemaps.write()))
        .pipe(plugins.if(argv.production, plugins.uglify()))
        .on('error', plugins.notify.onError("Uglify error: <%= error.file %> <%= error.message %>"))
        .pipe(gulp.dest(paths.js.dest));
});

gulp.task('img', function () {
    return gulp.src(paths.img.src)
    .pipe(imagemin(
        [
            //pngquant({quality: '55-65'}),
            imageminMozjpeg({quality: 90}),
            imageminSvgo()
        ]
    ))
    .pipe(gulp.dest(paths.img.dest))
});

gulp.task('build', [
    'css',
    'fileinclude'
    // 'js',
    // 'img'
]);

gulp.task('default', ['build'], function () {
    gulp.watch(paths.css.watch, ['css']);
    gulp.watch(path.join(paths.tpl.src, '**/*.html'), ['fileinclude']);
    // gulp.watch(paths.js.src, ['js']);
    //gulp.watch(paths.img.src, ['img']);
    plugins.livereload.listen()
});

/* ################################################################################################################## */
