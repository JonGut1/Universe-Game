var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();

browserSync.init({
     server: "dist/",
     browser: ["google chrome"],
     port: 4000
});

gulp.task('start', function(done) {
	gulp.watch('src/css/*.scss', gulp.series('styles'))
	gulp.watch('src/index.html', gulp.series('copy-html'))
	gulp.watch('src/js/*.js', gulp.series('scripts'))
	done()
});

gulp.task('styles', function(done) {
	gulp.src('src/css/*.scss')
	.pipe(sass().on('error', sass.logError))
	.pipe(autoprefixer({
		browsers: ['last 2 versions']
	}))
	.pipe(gulp.dest('dist/css'))
	browserSync.reload();
	done()
});

gulp.task('scripts', function(done) {
	gulp.src('src/js/*.js')
    .pipe(gulp.dest('dist/js'))
	browserSync.reload();
	done()
});

gulp.task('copy-html', function(done) {
	gulp.src('src/*.html')
	.pipe(gulp.dest('dist'))
	browserSync.reload();
	done()
});