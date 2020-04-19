const assert = require('assert');
const samd = require('../dist/samd');
const { createMockWindow } = require('./util/mock');
const { assertInvariants } = require('./util/helpers');

describe('SAMD', () => {
  let window;

  beforeEach('Create mock window', () => {
    window = createMockWindow();
    samd(window);
  });

  afterEach('Invariants', async () => {
    await assertInvariants(window);
  });

  it('should allow defining and requiring a module (exports)', () => {
    window.define('test', (require, exports) => {
      exports.foo = 'bar';
    });

    assert.deepStrictEqual(window.require('test'), { foo: 'bar' });
  });

  it('should allow defining and requiring a module (module.exports)', () => {
    window.define('test', (require, exports, module) => {
      module.exports = { foo: 'bar' };
    });

    assert.deepStrictEqual(window.require('test'), { foo: 'bar' });
  });

  it('should allow defining and requiring a module (return exports)', () => {
    window.define('test', () => {
      return { foo: 'bar' };
    });

    assert.deepStrictEqual(window.require('test'), { foo: 'bar' });
  });

  it('should allow defining and requiring a module (object export)', () => {
    window.define('test', { foo: 'bar' });

    assert.deepStrictEqual(window.require('test'), { foo: 'bar' });
  });

  it('should expose "require", "exports", "module" as default dependencies', () => {
    window.define('test', (require, exports, module) => {
      assert.strictEqual(typeof require, 'function');
      assert.strictEqual(typeof exports, 'object');
      assert.strictEqual(typeof module, 'object');
      assert.strictEqual(exports, module.exports);
    });

    window.require('test');
  });

  it('should correctly resolve explicit "require", "exports", "module", dependencies', () => {
    window.define(
      'test',
      ['exports', 'module', 'require'],
      (exports, module, require) => {
        assert.strictEqual(typeof exports, 'object');
        assert.strictEqual(typeof module, 'object');
        assert.strictEqual(typeof require, 'function');
        assert.strictEqual(exports, module.exports);
      }
    );

    window.require('test');
  });

  it('should allow defining a module with zero dependencies', () => {
    window.define('test', [], (...args) => {
      assert.strictEqual(args.length, 0);

      return { foo: 'bar' };
    });

    assert.deepStrictEqual(window.require('test'), { foo: 'bar' });
  });

  it('should allow defining a module with a dependency', () => {
    window.define('test', ['dep'], (dep) => {
      return { foo: 'bar', ...dep };
    });

    window.define('dep', (require, exports) => {
      exports.bar = 'baz';
    });

    assert.deepStrictEqual(window.require('test'), { foo: 'bar', bar: 'baz' });
  });

  it('should allow defining a module with multiple dependencies', () => {
    window.define('test', ['a', 'b'], (a, b) => {
      return { foo: 'bar', a, b };
    });

    window.define('a', (require, exports) => {
      exports.name = 'a';
    });

    window.define('b', (require, exports) => {
      exports.name = 'b';
    });

    assert.deepStrictEqual(window.require('test'), {
      foo: 'bar',
      a: { name: 'a' },
      b: { name: 'b' }
    });
  });

  it('should allow defining circular dependencies', () => {
    window.define('test', ['exports', 'dep'], (exports, dep) => {
      exports.foo = 'bar';
      exports.fooUpper = () => {
        return dep.fooUpper();
      };
    });

    window.define('dep', ['exports', 'test'], (exports, test) => {
      exports.fooUpper = () => {
        return test.foo.toUpperCase();
      };
    });

    assert.strictEqual(window.require('test').fooUpper(), 'BAR');
  });

  it('should throw an error when trying to require an undefined module', () => {
    assert.throws(() => {
      window.require('test');
    }, /Undefined module test/);
  });

  it('should throw an error when trying to require an undefined module as a dependency', () => {
    window.define('test', ['dep'], () => ({}));

    assert.throws(() => {
      window.require('test');
    }, /Undefined module dep/);

    assert.throws(() => {
      window.require('test');
    }, /Undefined module dep/);
  });

  it('should throw an error when trying to require an undefined module as a dependency (2)', () => {
    window.define('test', ['a', 'b'], () => ({}));
    window.define('a', () => ({}));

    assert.throws(() => {
      window.require('test');
    }, /Undefined module b/);

    assert.throws(() => {
      window.require('test');
    }, /Undefined module b/);
  });

  it('should throw an error when trying to require an undefined module as a secondary dependency', () => {
    window.define('test', ['a'], () => ({}));
    window.define('a', ['b'], () => ({}));

    assert.throws(() => {
      window.require('test');
    }, /Undefined module b/);

    assert.throws(() => {
      window.require('test');
    }, /Undefined module b/);
  });

  // async

  it('should allow requiring a module asynchronously', (done) => {
    window.define('test', () => {
      return { foo: 'bar' };
    });

    let required = false;

    window.require(['test'], (test) => {
      required = true;
      assert.deepStrictEqual(test, { foo: 'bar' });
      done();
    });

    // must not be required yet (proper async)
    assert.strictEqual(required, false);
  });

  it('should allow requiring asynchronously defined modules', (done) => {
    window.require.timeout = 200;

    setTimeout(() => {
      window.define('a', ['b', 'c'], () => ({ name: 'a' }));
    }, 50);

    setTimeout(() => {
      window.define('b', ['c'], () => ({ name: 'b' }));
    }, 100);

    setTimeout(() => {
      window.define('c', () => ({ name: 'c' }));
    }, 150);

    window.require(
      ['a'],
      (a) => {
        assert.deepStrictEqual(a, { name: 'a' });
      },
      (err) => done(err)
    );

    window.require(
      ['b'],
      (b) => {
        assert.deepStrictEqual(b, { name: 'b' });
      },
      (err) => done(err)
    );

    window.require(
      ['c'],
      (c) => {
        assert.deepStrictEqual(c, { name: 'c' });
      },
      (err) => done(err)
    );

    window.require(
      ['a', 'b', 'c'],
      () => {
        done();
      },
      (err) => done(err)
    );
  });

  it('should reject with an error when trying to require an undefined module asynchronously', (done) => {
    window.require.timeout = 100;

    window.require(
      ['test'],
      () => {
        done(new Error('Successful resolve should not happen'));
      },
      (err) => {
        assert.strictEqual(err.message, 'Undefined module test');
        done();
      }
    );
  });

  it('should throw an uncaught error when trying to require an undefined module asynchronously without a reject argument', (done) => {
    window.require.timeout = 100;

    window.require(['test'], () => {
      done(new Error('Successful resolve should not happen'));
    });

    setTimeout(() => {
      assert.strictEqual(window.__uncaughtErrors.length, 1);
      assert.strictEqual(
        window.__uncaughtErrors[0].message,
        'Undefined module test'
      );
      window.__uncaughtErrors = [];
      done();
    }, 200);
  });

  it('should throw when trying to define an already defined module', () => {
    window.define('test', { foo: 'bar' });

    assert.throws(() => {
      window.define('test', { foo: 'baz' });
    }, /Module test is already defined/);

    assert.deepStrictEqual(window.require('test'), { foo: 'bar' });
  });
});
