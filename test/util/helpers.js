const assert = require('assert');

async function assertInvariants(window) {
  assert.strictEqual(typeof window.define, 'function');
  assert.strictEqual(typeof window.require, 'function');
  assert.strictEqual(typeof window.requireAsync, 'function');
  assert.ok(!window.define.__id);

  await poll(() => assert.strictEqual(window.__timeouts.size, 0), 10, 1000);

  assert.deepStrictEqual(window.__uncaughtErrors, []);
}

async function poll(test, interval, timeout) {
  return new Promise((resolve, reject) => {
    try {
      resolve(test());
    } catch (err) {
      if (interval > timeout) {
        reject(err);
      } else {
        setTimeout(() => {
          resolve(poll(test, interval, timeout - interval));
        }, interval);
      }
    }
  });
}

module.exports = { assertInvariants, poll };
