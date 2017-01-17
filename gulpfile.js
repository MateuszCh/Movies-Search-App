/**
 * Created by Mateusz Chybiorz on 2017-01-13.
 */
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    prefix = require('gulp-autoprefixer'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps');

function errorLog(error){
    console.error.bind(error);
    this.emit('end');
}

// Styles Task
// Sass
gulp.task('styles', function(){
    gulp.src("app/sass/main.scss")
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}))
        .on('error', errorLog)
        .pipe(prefix('> 1%'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('app/css'))
        .pipe(reload({stream: true}));
});

// Scripts Task
//Uglifies
gulp.task('scripts', function(){
    gulp.src('app/js/*.js')
        .pipe(uglify())
        .on('error', errorLog)
        .pipe(concat('main.js'))
        .pipe(gulp.dest('app/minjs'))
        .pipe(reload({stream: true}));
});

// HTML Task
gulp.task('html', function(){
    gulp.src('app/*.html')
        .pipe(reload({stream: true}));
});

// Image Task
// Compress
gulp.task('image', function(){
    gulp.src('app/imgUn/*')
        .pipe(imagemin())
        .pipe(gulp.dest('app/images'));
});

// Browser-Sync Task
gulp.task('browser-sync', function(){
    browserSync({
        server: {
            baseDir: "./app/"
        }
    })
});

// Watch Task
gulp.task('watch', function(){
    gulp.watch('app/js/*.js', ['scripts']);
    gulp.watch('app/**/*.html', ['html']);
    gulp.watch('app/sass/**/*.scss', ['styles']);
});

gulp.task('default', ['scripts', 'styles', 'html', 'browser-sync', 'watch']);