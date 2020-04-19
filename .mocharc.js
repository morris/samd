module.exports = {
  recursive: true,
  ignore: 'test/fixtures/**',
  'watch-files': ['dist/samd.js', 'test/**'],
  reporter: 'spec',
  slow: 500,
  timeout: 10000
};
