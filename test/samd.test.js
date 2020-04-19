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

  it('should infer module IDs of anonymous definitions in scripts', (done) => {
    const scripts = fixtures.map((module) => {
      return createMockScript({
        src: module.src,
        attributes:
          Math.random() > 0.5
            ? {}
            : {
                'data-id': module.id
              },
        __exec: () => {
          if (module.named) {
            window.define(module.id, ['exports'], (exports) => {
              exports.name = module.id;
            });
          } else {
            window.define(['exports'], (exports) => {
              exports.name = module.id;
            });
          }
        }
      });
    });

    for (const script of scripts) {
      setTimeout(() => window.__execScript(script), Math.random * 300);
    }

    for (const module of fixtures) {
      window.require(
        [module.id],
        (m) => {
          assert.deepStrictEqual(m, { name: module.id });
        },
        done
      );
    }

    window.require.timeout = 400;
    window.require(
      fixtures.map((module) => module.id),
      () => {
        done();
      },
      done
    );
  });

  it('should use define.__id if set', () => {
    const script = createMockScript({
      __exec: () => {
        window.define.__id = 'test';
        window.define(['exports'], (exports) => {
          exports.name = 'test';
        });
        window.define.__id = 0;
      }
    });

    window.__execScript(script);

    assert.deepStrictEqual(window.require('test'), { name: 'test' });
  });

  it('should throw an error when trying to define an anonymous module in an inline script', () => {
    const script = createMockScript({
      __exec: () => {
        window.define(['exports'], (exports) => {
          exports.name = 'test';
        });
      }
    });

    window.__execScript(script);

    assert.deepStrictEqual(
      window.__uncaughtErrors.map((it) => it.message),
      ['Cannot infer module ID from inline script']
    );

    window.__uncaughtErrors = [];
  });
});
