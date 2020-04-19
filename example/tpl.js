const fs = require('fs');

const input = fs.readFileSync(process.argv[2]).toString();
const output = eval(`\`${input}\``);

fs.writeFileSync(process.argv[3], output);
