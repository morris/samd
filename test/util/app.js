const express = require('express');
const { readFileSync } = require('fs');
const fixtures = require('../fixtures/modules');

const TEMPLATE = readFileSync(
  __dirname + '/../fixtures/template.html'
).toString();

function createTestApp() {
  const app = express();

  app.get('/', (req, res) => {
    const pdefer = parseOptionalFloat(req.query.pdefer, 0.33);
    const pasync = parseOptionalFloat(req.query.pasync, 0.33);
    const compat = req.query.compat;

    const body = [];

    body.push(`<script src="scripts/vendor/samd.js"></script>`);

    if (compat) {
      body.push('<script>define.compat = true;</script>');
    }

    const scripts = fixtures.map((module) => {
      const adefer = Math.random() < pdefer ? 'defer' : '';
      const aasync = !adefer && Math.random() < pasync ? 'async' : '';

      return `<script crossorigin ${adefer} ${aasync} src="${module.src}"></script>`;
    });

    body.push(...scripts);

    const requires = fixtures.map((it) => it.id);

    body.push(
      `<script>
        require(${JSON.stringify(requires)}, function () {
          console.log("OK");
        });
      </script>`
    );

    res.end(
      TEMPLATE.replace('%%pdefer%%', pdefer)
        .replace('%%pasync%%', pasync)
        .replace('%%compat%%', compat ? 'checked' : '')
        .replace('%%body%%', body.join('\n'))
    );
  });

  app.get('/scripts/vendor/samd.js', (req, res) => {
    res.sendFile('dist/samd.js', { root: __dirname + '/../..' });
  });

  app.get('/scripts/vendor/samd.min.js', (req, res) => {
    res.sendFile('dist/samd.min.js', { root: __dirname + '/../..' });
  });

  app.use('/', express.static(__dirname + '/../fixtures'));

  return app;
}

function parseOptionalFloat(str, def) {
  const f = parseFloat(str);

  return isFinite(f) ? f : def;
}

module.exports = {
  createTestApp
};

if (require.main === module) {
  const app = createTestApp();
  const server = app.listen(
    process.env.PORT ? parseInt(process.env.PORT, 10) : 9999,
    () => {
      // eslint-disable-next-line no-console
      console.log(`Test app listening on port ${server.address().port}`);
    }
  );
}
