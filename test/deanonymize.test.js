const assert = require('assert');
const samd = require('../dist/samd');
const { createMockWindow, createMockScript } = require('./util/mock');
const { assertInvariants } = require('./util/helpers');
const fixtures = require('./fixtures/modules');

describe('SAMD', () => {
  let window;

  beforeEach('Create mock window', () => {
    window = createMockWindow();
    samd(window);
  });

  afterEach('Invariants', async () => {
    await assertInvariants(window);
  });

  it('should deanonymize modules if document.currentScript is not available', (done) => {
    window.define.compat = true;

    for (const module of fixtures) {
      window.__onXhrSend((xhr) => {
        if (xhr.url === module.src) {
          setTimeout(() => {
            xhr.readyState = 4;
            xhr.status = 200;
            xhr.responseText = `define(function anonymous(r, exports) { exports.name = ${JSON.stringify(
              module.id
            )}; })`;
            xhr.onreadystatechange();
          }, Math.random * 100);
        }
      });
    }

    const samdScript = createMockScript({ src: 'scripts/vendor/samd.js' });
    window.document.body.appendChild(samdScript);

    const scripts = fixtures.map((module) => {
      return createMockScript({
        src: module.src,
        __exec: () => {
          const fn = new Function(
            'r',
            'exports',
            `exports.name = ${JSON.stringify(module.id)};`
          );

          if (module.named) {
            window.define(module.id, fn);
          } else {
            window.define(fn);
          }
        }
      });
    });

    for (const script of scripts) {
      window.document.body.appendChild(script);

      if (Math.random() > 0.33) {
        setTimeout(
          () => window.__execScript(script),
          300 + Math.random() * 200
        );
      } else {
        window.__execScript(script);
      }
    }

    const otherScript = createMockScript({ type: 'other', src: 'fake' });
    window.document.body.appendChild(otherScript);

    const inlineScript = createMockScript({});
    window.document.body.appendChild(inlineScript);

    window.require.timeout = 1000;
    window.require(
      fixtures.map((module) => module.id),
      () => {
        assert.deepStrictEqual(window.__warnings, [
          'Deanonymization triggered'
        ]);
        done();
      },
      done
    );
  });
});
