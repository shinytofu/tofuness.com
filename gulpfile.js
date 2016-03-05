var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var gulpif = require('gulp-if');
var rev = require('gulp-rev');
var del = require('del');
var env = process.env.NODE_ENV;

if (env) env = env.replace(/\W/g, '');

var path = {
	scss: {
		src: './src/css/style.scss',
		files: './src/css/**/*.scss',
		dest: './build'
	},
	js: {
		src: [
			'./src/js/includes/*.js',
			'./src/js/main.js'
		],
		files: './src/js/**/*.js',
		dest: './build'
	}
};

gulp.task('sass', ['preclean'], function() {
	return gulp.src(path.scss.src)
		.pipe(plumber(function(err) {
			console.log(err.message);
			this.emit('end');
		}))
		.pipe(sass({
			outputStyle: 'compressed'
		}))
		.pipe(gulp.dest(path.scss.dest));
});

gulp.task('uglify', ['preclean'], function() {
	return gulp.src(path.js.src)
	.pipe(plumber(function(err) {
		console.log(err.message);
		this.emit('end');
	}))
	.pipe(concat('main.js'))
	.pipe(gulpif(env === 'production', uglify()))
	.pipe(gulp.dest(path.js.dest));
});

gulp.task('version', ['uglify', 'sass'], function() {
	return gulp.src('./build/*')
	.pipe(rev())
	.pipe(gulp.dest('build'))
	.pipe(rev.manifest())
	.pipe(gulp.dest('build'));
});

gulp.task('preclean', function(cb) {
	if (env !== 'production') return cb();
	del([
		'./build/*',
		'!./build/components.js',
	], cb);
});

gulp.task('postclean', ['version'], function(cb) {
	del([
		'./build/main.js',
		'./build/components.js',
		'./build/style.css'
	], cb);
});

gulp.task('watch', function() {
	gulp.watch(path.scss.files, ['sass']);
	gulp.watch(path.js.files, ['uglify']);
});

// Build React components with webpack before going gulp build
gulp.task('build', ['postclean']);
gulp.task('default', ['sass' , 'uglify', 'watch']);
