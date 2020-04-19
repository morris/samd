# SAMD

A tiny, static [AMD](https://github.com/amdjs/amdjs-api) API implementation
that __enables including AMD modules in regular `script` tags.__

*SAMD is currently experimental, and awaiting feedback.*

- __1.3 KB__ minified & gzipped
- No dynamic loading; all scripts are __loaded by the browser__
- Works in __every browser alive__
- Supports `<script defer>` & `<script async>`
- Allows progressive optimizations without impact on development

When combined with [TypeScript](typescriptlang.org),
SAMD may be used as an alternative to traditional JS bundling
(e.g. `webpack` or `rollup`).
This is the main use case for SAMD, as described below.
An example project can be inspected under `/example`.

## Basic usage

SAMD enables inclusion of UMD/AMD modules in regular `script` tags:

```html
<script src="https://unpkg.com/samd@1/samd.js" crossorigin></script>
<script async src="https://unpkg.com/moment@2/moment.js" crossorigin></script>
<script async src="https://unpkg.com/lodash@4/lodash.js" crossorigin></script>
<!-- more UMD/AMD dependencies... -->
<script>
  require(['moment', 'lodash'], function (moment, _) {
    // use dependencies
  });
</script>
```

No additional script loader or special markup is required.

## Usage with TypeScript

Given a regular ES6/TypeScript project, with NPM dependencies and
[TypeScript configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
in place, TypeScript is able to produce one-file AMD builds with wide browser
compatibility out-of-the-box:

```sh
tsc --outFile scripts/dist/app.js --target ES5 --module AMD
```

This generates an ES5 AMD bundle of the project, not including NPM modules but
explicitly referencing NPM imports as AMD dependencies.
Note that TypeScript is able to handle JS/JSX projects by using `--allowJs`.

This _application bundle_ can be used directly in a website
by including SAMD and UMD builds of the application dependencies from
e.g. [unpkg](https://unpkg.com/):

```html
<div id="root"></div>
<script src="https://unpkg.com/samd@1/samd.js" crossorigin></script>
<script src="https://unpkg.com/react@16/umd/react.development.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js" crossorigin></script>
<!-- more UMD/AMD dependencies... -->
<script src="scripts/dist/app.js"></script>
<script>
  // assuming the entrypoint is index.ts/index.js and it exports an init() function:
  require(["scripts/index"], function (index) {
    index.init();
  });
</script>
```

SAMD infers module IDs from script `src` attributes, allowing
the original NPM imports to be resolved from the application bundle.

This setup is sufficient for development:

- It works in modern browsers.
- Application code is based on modern JS/TypeScript with ES6 imports.
- TypeScript's watch mode may be used to continuously build the application bundle.
- Source maps are supported.

Note that CommonJS-only dependencies cannot be used.
Dependencies must provide UMD/AMD builds (most popular libraries do, though).

### Production

In production environments, the respective production/minified builds of
dependencies should be used. Polyfills may be included using e.g.
[polyfill.io](https://polyfill.io/). For further optimization, the application
bundle may be minified through [terser](https://terser.org/).

```html
<script src="https://polyfill.io/v3/polyfill.min.js" crossorigin></script>
<script src="https://unpkg.com/samd@1/samd.min.js" crossorigin></script>
<script src="https://unpkg.com/react@16/umd/react.production.min.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@16/umd/react-dom.production.min.js" crossorigin></script>
<script src="scripts/dist/app.min.js"></script>
```

It is reasonable to serve separate HTML documents for development and
production environments. Employ templating techniques at build-time or on
server-side as needed.

Because of `unpkg`'s CDN, this setup is fairly performant when using popular
libraries. It is also widely compatible regarding browser support, depending on
the chosen TypeScript target.

### Self-hosting

If vendor dependencies need to be self-hosted, it is recommended
to copy the respective builds from `node_modules` to e.g. `scripts/vendor`.
Compiling the set of polyfills is out of scope for this document.

```html
<script src="scripts/vendor/polyfills.min.js"></script>
<script src="scripts/vendor/samd.min.js"></script>
<script src="scripts/vendor/react.production.min.js"></script>
<script src="scripts/vendor/react-dom.production.min.js"></script>
<script src="scripts/dist/app.min.js"></script>
```

It is encouraged to automate copying and other build steps through one or
more shell scripts (see `build.sh` in the example project).
Remember that SAMD infers AMD module IDs from script filenames
(after last `/`, before first `.`, while still allowing `@org/package`).

When served with HTTP/2, this setup is sufficiently performant for a wide range
of websites.

### Bundling

When having many vendor dependencies or when HTTP/2 is unavailable,
all scripts may be concatenated into a single file
(optionally running it through `terser` again).

```html
<script src="scripts/bundle.min.js"></script>
```

However, because UMD modules usually define anonymous modules,
SAMD is not able to identify individual module IDs of a bundle without user
input, so bundling cannot work by simple concatenation.

For this use case, SAMD ships with a CLI to infer and inject module IDs into
given UMD module files (see `build.sh` in the example project).
This CLI can also be used for concatenation.

```sh
samd -o scripts/dist/bundle.js \
  scripts/vendor/polyfills.min.js \
  scripts/vendor/samd.min.js \
  scripts/vendor/react.production.min.js \
  scripts/vendor/react-dom.production.min.js \
  scripts/dist/app.min.js
terser scripts/dist/bundle.js -o scripts.dist.bundle.js
```

Note that his only has to be done in bundling scenarios.

### Libraries

SAMD is only useful for applications.
Packages for web usage should be distributed as UMD for maximum compatibility.

## Conclusion

The presented TypeScript/SAMD-based workflow has useful properties and is fully
compatible with the web platform.

- Works with modern ES6/TypeScript codebases, with little implications
- Wide browser compatibility
- Loading of scripts is handled and optimized by the browser
- Production optimizations are progressive and don't impact development
- Bundling is (almost) reduced to simple concatenation

At any point of the workflow, it is advised to measure page load performance
and user experience, and only proceed optimizing if needed.

### Limitations

- Dependencies must provide AMD/UMD builds.
- Multiple versions of dependencies are not supported.
- CommonJS is not supported.
- No tree-shaking.
- Relative module dependencies are not supported (yet).
