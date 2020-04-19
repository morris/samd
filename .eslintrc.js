module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2018
  },
  env: {
    node: true,
    es6: true
  },
  extends: ['eslint:recommended'],
  rules: {
    'no-console': 'error'
  }
};
