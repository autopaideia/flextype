const customLaunchers = {
  sl_chrome: {
    base: 'SauceLabs',
    browserName: 'chrome',
    platform: 'Windows 7',
  },
  sl_firefox: {
    base: 'SauceLabs',
    browserName: 'firefox',
  },
  sl_mac_safari: {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.10',
  },
  sl_ie_9: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 7',
    version: '9',
  },
  sl_ie_10: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 8',
    version: '10',
  },
  sl_ie_11: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 8.1',
    version: '11',
  },
  sl_edge: {
    base: 'SauceLabs',
    browserName: 'MicrosoftEdge',
    platform: 'Windows 10',
  },
  sl_ios_safari_8: {
    base: 'SauceLabs',
    browserName: 'iphone',
    version: '8.4',
  },
  sl_ios_safari_9: {
    base: 'SauceLabs',
    browserName: 'iphone',
    version: '9.3',
  },
  sl_android_5_1: {
    base: 'SauceLabs',
    browserName: 'android',
    version: '5.1',
  },
};

module.exports = (config) => {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: ['src/**/*.js', 'test/**/*.spec.js'],
    reporters: ['dots', 'saucelabs', 'coverage'],
    preprocessors: {
      '**/src/**/*.js': ['coverage', 'babel'],
      'test/**/*.spec.js': ['babel'],
    },
    babelPreprocessor: {
      filename(file) {
        return file.originalPath.replace(/\.js$/, '.es5.js');
      },
      sourceFileName(file) {
        return file.originalPath;
      },
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    sauceLabs: {
      testName: 'Flextype',
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
      username: process.env.SAUCE_USERNAME,
      accessKey: process.env.SAUCE_ACCESS_KEY,
      startConnect: false,
    },
    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/',
    },
    customLaunchers,
    browsers: Object.keys(customLaunchers),
    singleRun: true,
    captureTimeout: 300000,
    browserNoActivityTimeout: 300000,
  });
};
