(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    // eslint-disable-next-line no-undef
    module.exports = factory;
  } else {
    factory(global);
  }
})(typeof self !== 'undefined' ? self : this, function (global) {
  var document = global.document;
  var setTimeout = global.setTimeout;
  var clearTimeout = global.clearTimeout;
  var console = global.console;
  var XMLHttpRequest = global.XMLHttpRequest;

  var defineCallbacks = [];

  function define(id, dependencies, factory) {
    var def = global.define;

    if (typeof id !== 'string') {
      factory = dependencies;
      dependencies = id;

      var currentScript = document.currentScript;
      id =
        def.__id ||
        (define.compat ? 0 : currentScript && def.inferId(currentScript));
    }

    if (!factory) {
      factory = dependencies;
      dependencies = ['require', 'exports', 'module'];
    }

    if (!id) {
      return def.deanonymize(factory, dependencies);
    }

    var modules = def.modules;

    if (modules[id]) {
      throw new Error('Module ' + id + ' is already defined');
    }

    modules[id] =
      typeof factory === 'function'
        ? {
            id: id,
            factory: factory,
            dependencies: dependencies,
            exports: {},
            loaded: false
          }
        : {
            id: id,
            exports: factory,
            loaded: true
          };

    for (var i = 0; i < defineCallbacks.length; ++i) {
      if (defineCallbacks[i]()) defineCallbacks.splice(i--, 1);
    }
  }

  define.amd = {};
  define.modules = {};

  define.inferId = function (script) {
    var idAttr = script.getAttribute('data-id');
    if (idAttr) return idAttr;

    var src = script.src;

    if (!src) {
      throw new Error('Cannot infer module ID from inline script');
    }

    var unpkg = src.match(/\/\/unpkg.com\/(@[^/]+\/[^/@]+|[^/@]+)/);
    if (unpkg) return unpkg[1];

    var cdnjs = src.match(/\/\/cdnjs.cloudflare.com\/ajax\/libs\/([^/]+)/);
    if (cdnjs) return cdnjs[1];

    var filename = src.match(/(^|\/)(@[^/]+\/[^/.]+|[^/.]+)[^/]*$/);
    if (filename) return filename[2];

    throw new Error('Cannot infer module ID from ' + src);
  };

  var deanonymizeWarning = false;
  var deanonymizeQueue = [];
  var deanonymizeTimeout;

  define.deanonymize = function (factory, dependencies) {
    if (!deanonymizeWarning && console) {
      deanonymizeWarning = true;
      console.warn('Deanonymization triggered');
    }

    deanonymizeQueue.push([factory, dependencies]);

    clearTimeout(deanonymizeTimeout);
    deanonymizeTimeout = setTimeout(function () {
      var scripts = document.getElementsByTagName('script');

      for (var i = 0, l = scripts.length; i < l; ++i) {
        handleScript(scripts[i]);
      }
    }, 0);

    function handleScript(script) {
      if (
        !script.src ||
        (script.type &&
          !script.type.match(/^application|text\/(java|ecma)script$/))
      ) {
        return;
      }

      var id = global.define.inferId(script);
      if (script.__source) return handleSource(id, script.__source);

      if (script.__pending) return;
      script.__pending = true;

      var xhr = new XMLHttpRequest();
      xhr.open('get', script.src, true);
      xhr.withCredentials =
        script.getAttribute('crossorigin') === 'use-credentials';

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status < 400) {
          script.__source = xhr.responseText;
          handleSource(id, script.__source);
        }
      };

      xhr.send();
    }

    function handleSource(id, source) {
      for (var i = 0; i < deanonymizeQueue.length; ++i) {
        var entry = deanonymizeQueue[i];

        if (stripWs(source).indexOf(stripWs(entry[0].toString())) >= 0) {
          global.define(id, entry[1], entry[0]);
          deanonymizeQueue.splice(i--, 1);
        }
      }
    }

    function stripWs(str) {
      return str.replace(/\s+/g, '');
    }
  };

  function require(id, resolve, reject) {
    if (resolve) {
      return global.requireAsync(
        id,
        function (resolved) {
          resolve.apply(undefined, resolved);
        },
        reject
      );
    }

    var req = global.require;
    var definition = global.define.modules[id];

    if (!definition) {
      throw new Error('Undefined module ' + id);
    }

    if (!definition.loaded) {
      definition.loaded = true;

      try {
        var returnExports = definition.factory.apply(
          undefined,
          definition.dependencies.map(function (id) {
            switch (id) {
              case 'require':
                return req;
              case 'exports':
                return definition.exports;
              case 'module':
                return definition;
              default:
                return req(id);
            }
          })
        );
      } catch (err) {
        definition.loaded = false;
        throw err;
      }

      if (returnExports) definition.exports = returnExports;
    }

    return definition.exports;
  }

  require.timeout = 10000;

  function requireAsync(ids, resolve, reject) {
    var req = global.require;
    var done = false;
    var pending = false;

    setTimeout(callback, 0);

    var timeout = setTimeout(function () {
      callback(true);
    }, req.timeout);

    function callback(timedOut) {
      try {
        if (!done)
          resolve(
            ids.map(function (id) {
              return req(id);
            })
          );
      } catch (err) {
        if (!timedOut && err.message.slice(0, 16) === 'Undefined module') {
          if (!pending) defineCallbacks.push(callback);
          pending = true;

          return false;
        } else {
          setTimeout(function () {
            if (reject) return reject(err);
            throw err;
          }, 0);
        }
      }

      clearTimeout(timeout);
      return (done = true);
    }
  }

  global.define = define;
  global.require = require;
  global.requireAsync = requireAsync;
});
