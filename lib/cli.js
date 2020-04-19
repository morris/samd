const { readFile, writeFile } = require('fs');
const { promisify } = require('util');
const { hasAmdCheck, inferModuleId, injectModuleId } = require('./util');

const readFilep = promisify(readFile);
const writeFilep = promisify(writeFile);

const HELP = `samd [options] [filenames...]
  Concatenates JavaScript files, injecting AMD module IDs for SAMD.

Options:
  --help, -h           Print this help message.
  --output, -o <path>  Set output file path. Default is stdout.`;

async function cli(argv, console) {
  const args = parseCliArgs(argv);

  if (args.help) {
    return console.log(HELP);
  }

  const outputs = await Promise.all(
    args.filenames.map(async (filename) => {
      const input = (await readFilep(filename)).toString();

      if (!hasAmdCheck(input)) return input;

      const id = inferModuleId(filename);

      if (id) {
        return injectModuleId(input, id);
      } else {
        throw new Error(`Cannot infer module ID from ${filename}`);
      }
    })
  );

  if (args.output) {
    return writeFilep(args.output, outputs.join(''));
  }

  for (const output of outputs) {
    process.stdout.write(output);
  }
}

function parseCliArgs(argv) {
  const args = {
    filenames: []
  };

  for (let i = 0; i < argv.length; ++i) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--output' || arg === '--out' || arg === '-o') {
      args.output = argv[++i];
    } else if (!arg.startsWith('-')) {
      args.filenames.push(arg);
    }
  }

  return args;
}

module.exports = { cli, parseCliArgs, HELP };
