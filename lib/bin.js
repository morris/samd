#!/usr/bin/env node
const { cli } = require('./cli');

cli(process.argv.slice(2), console).catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err.stack);
  process.exit(1);
});
