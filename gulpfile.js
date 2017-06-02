const del = require('del');
const gulp = require('gulp');
const umd = require('gulp-umd');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const { prepend } = require('gulp-insert');
const { version, author, license } = require('./package.json');

const NAME = 'flextype';
const SRC = 'src/flextype.js';
const DEST = 'dist';
const CLEAN = ['dist'];
const UGLIFY = {
  output: { comments: /^!/ },
  mangle: { reserved: ['FlexType'] },
};
const BANNER = `/*!
 * flextype.js v${version}
 * (c) ${new Date().getFullYear()} ${author.name}
 * Released under the ${license} License.
 */
`;

gulp.task('clean', () => del(CLEAN));

gulp.task('default', ['clean'], () => gulp.src(SRC)
  .pipe(babel())
  .pipe(umd({ namespace: () => NAME, exports: () => NAME }))
  .pipe(prepend(BANNER))
  .pipe(gulp.dest(DEST))
  .pipe(uglify(UGLIFY))
  .pipe(rename({ extname: '.min.js' }))
  .pipe(gulp.dest(DEST)));
