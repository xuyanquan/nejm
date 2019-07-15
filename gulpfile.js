const path = require('path');
const gulp = require('gulp');
const babel = require('gulp-babel');
const clean = require('gulp-clean');

gulp.task('clean', function () {
    return gulp.src('lib', {read: false, allowEmpty: true})
        .pipe(clean());
});

gulp.task('build', function () {
    return gulp.src('src/nejRoot/**/*.js')
        .pipe(babel({
            plugins: [
                [path.join(__dirname, './dist/nej2common.js'), {
                    nejRoot: path.join(__dirname, './src/nejRoot')
                }]
            ]
        }))
        .pipe(gulp.dest('lib'));
});

gulp.task('default', gulp.series(['clean', 'build']));
