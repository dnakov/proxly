//npm install gulp gulp-minify-css gulp-uglify gulp-clean gulp-cleanhtml gulp-jshint gulp-strip-debug gulp-zip --save-dev
 
var gulp = require('gulp'),
	clean = require('gulp-clean'),
	cleanhtml = require('gulp-cleanhtml'),
	minifycss = require('gulp-minify-css'),
	jshint = require('gulp-jshint'),
	stripdebug = require('gulp-strip-debug'),
	uglify = require('gulp-uglify'),
	zip = require('gulp-zip'),
	args   = require('yargs').argv;

var directory = args.dir

//clean build directory
gulp.task('clean', function() {
	return gulp.src(directory + '/build/*', {read: false})
		.pipe(clean());
});
 
//copy static folders to build directory
gulp.task('copy', function() {
	gulp.src(directory + '/src/fonts/**')
		.pipe(gulp.dest(directory + '/build/fonts'));
	gulp.src(directory + '/src/images/**')
		.pipe(gulp.dest(directory + '/build/images'));
	gulp.src(directory + '/src/_locales/**')
		.pipe(gulp.dest(directory + '/build/_locales'));
	return gulp.src(directory + '/src/manifest.json')
		.pipe(gulp.dest(directory + '/build/'));
});
 
//copy and compress HTML files
gulp.task('html', function() {
	return gulp.src(directory + '/src/*.html')
		.pipe(cleanhtml())
		.pipe(gulp.dest(directory + '/build'));
});
 
//run scripts through JSHint
gulp.task('jshint', function() {
	return gulp.src(directory + '/src/scripts/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});
 
//copy vendor scripts and uglify all other scripts, creating source maps
gulp.task('scripts', function() {
	return gulp.src([directory + '/src/scripts/**/*.js'])
		.pipe(stripdebug())
		.pipe(uglify({outSourceMap: true}))
		.pipe(gulp.dest(directory + '/build/scripts'));
});
 
//minify styles
gulp.task('styles', function() {
// 	return gulp.src(directory + '/src/styles/**/*.css')
// 		.pipe(minifycss({root: directory + '/src/styles', keepSpecialComments: 0}))
// 		.pipe(gulp.dest(directory + '/build/styles'));
	return gulp.src(directory + '/src/styles/**')
		.pipe(gulp.dest(directory + '/build/styles'));
});
 
//build ditributable and sourcemaps after other tasks completed
gulp.task('zip', ['html', 'scripts', 'styles', 'copy'], function() {
	var manifest = require('./' + directory + '//src/manifest'),
		distFileName = manifest.name + ' v' + manifest.version + '.zip',
		mapFileName = manifest.name + ' v' + manifest.version + '-maps.zip';
	//collect all source maps
	gulp.src(directory + '/build/scripts/**/*.map')
		.pipe(zip(mapFileName))
		.pipe(gulp.dest('dist'));
	//build distributable extension
	return gulp.src([directory + '/build/**', '!' + directory + '//build/scripts/**/*.map'])
		.pipe(zip(distFileName))
		.pipe(gulp.dest('dist'));
});
 
//run all tasks after build directory has been cleaned
gulp.task('default', ['clean'], function() {
    gulp.start('zip');
});