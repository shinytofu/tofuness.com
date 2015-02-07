var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

var path = {
	scss: {
		src: 'src/css/style.scss',
		files: 'src/css/**/*.scss',
		dest: 'public/css'
	},
	js: {
		src: [
			'src/js/includes/lodash.js',
			'src/js/includes/traer.js',
			'src/js/includes/*.js',
			'src/js/main.js'
		],
		files: 'src/js/**/*.js',
		dest: 'public/js'
	}
}

gulp.task('sass', function() {
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

gulp.task('uglify', function() {
	return gulp.src(path.js.src)
	.pipe(plumber(function(err) {
		console.log(err.message);
		this.emit('end');
	}))
	.pipe(concat('main.js'))
	//.pipe(uglify())
	.pipe(gulp.dest(path.js.dest));
});

gulp.task('watch', function() {
	gulp.watch(path.scss.files, ['sass']);
	gulp.watch(path.js.files, ['uglify']);
});

gulp.task('default', ['sass' , 'uglify', 'watch']);
