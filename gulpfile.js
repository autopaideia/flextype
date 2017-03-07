const del = require('del');
const gulp = require('gulp');
const umd = require('gulp-umd');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const { prepend } = require('gulp-insert');
const { version, author, license } = require('./package.json');

const CONF = {
  name: 'flextype',
  src: 'src/flextype.js',
  dest: 'dist',
  clean: ['dist'],
  uglify: { preserveComments: 'license', mangle: { except: ['FlexType'] } },
  banner: `/*!
 * flextype.js v${version}
 * (c) ${new Date().getFullYear()} ${author.name}
 * Released under the ${license} License.
 */
`,
};

gulp.task('clean', () => del(CONF.clean));

gulp.task('default', ['clean'], () => gulp.src(CONF.src)
  .pipe(babel())
  .pipe(umd({ namespace: () => CONF.name, exports: () => CONF.name }))
  .pipe(prepend(CONF.banner))
  .pipe(gulp.dest(CONF.dest))
  .pipe(uglify(CONF.uglify))
  .pipe(rename({ extname: '.min.js' }))
  .pipe(gulp.dest(CONF.dest)));
