function hasAmdCheck(code) {
  return code.match(/&&\s*define.amd/);
}

function inferModuleId(filename) {
  const m = filename.match(/(^|[/\\])(@[^/\\]+[/\\][^/\\.]+|[^/\\.]+)[^/\\]*$/);

  return m && m[2];
}

function injectModuleId(code, id) {
  return `define.__id=${JSON.stringify(
    id
  )};try{${code}\n}catch(e){define.__id=0;throw e}define.__id=0;`;
}

module.exports = {
  hasAmdCheck,
  injectModuleId,
  inferModuleId
};
