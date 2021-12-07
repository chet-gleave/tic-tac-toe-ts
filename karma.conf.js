module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'node_modules/@babel/polyfill/dist/polyfill.js',
      'js/*.ts',
      '**.html',
      'css/*.css'
    ],
    plugins: [
      'karma-jasmine',
      'karma-jasmine-html-reporter',
      'karma-html2js-preprocessor',
      'karma-chrome-launcher',
      require('./dependency')
    ],
    preprocessors: {
      'js/**/*.ts': 'babelTypeScript',
      '**/*.html': ['html2js']
    },
    babelPreprocessor: {
      options: {
        presets: ['@babel/preset-env']
      }
    },
    customPreprocessors: {
      babelTypeScript: {
        base: 'babel',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-typescript'],
          sourceMap: 'inline'
        },
        filename: function (file) {
          return file.originalPath.replace(/\.ts$/, '.js');
        }
      },
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    concurrency: Infinity
  })
}
