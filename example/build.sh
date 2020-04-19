set -ex

# variables
SCRIPTS=public/scripts
VENDOR=$SCRIPTS/vendor
DIST=$SCRIPTS/dist

# prepare directories
mkdir -p $VENDOR
mkdir -p $DIST

# copy vendor dependencies
cp \
  node_modules/samd/dist/samd.js \
  node_modules/samd/dist/samd.min.js \
  node_modules/lodash/lodash.js \
  node_modules/lodash/lodash.min.js \
  node_modules/moment/moment.js \
  node_modules/moment/min/moment.min.js \
  node_modules/react/umd/react.development.js \
  node_modules/react/umd/react.production.min.js \
  node_modules/react-dom/umd/react-dom.development.js \
  node_modules/react-dom/umd/react-dom.production.min.js \
  $VENDOR

# build application bundle
# see tsconfig.json for options
tsc

# minify application bundle
terser $DIST/app.js --compress --mangle --output $DIST/app.min.js

# build production bundle
samd --output $DIST/bundle.js \
  $VENDOR/samd.min.js \
  $VENDOR/lodash.min.js \
  $VENDOR/moment.min.js \
  $VENDOR/react.production.min.js \
  $VENDOR/react-dom.production.min.js \
  $DIST/app.min.js

# minify production bundle
terser $DIST/bundle.js --compress --mangle --output $DIST/bundle.min.js

# build html documents
SCRIPT_SRC=unpkg node tpl.js public/template.html public/index.html
SCRIPT_SRC=vendor node tpl.js public/template.html public/index.vendor.html
SCRIPT_SRC=bundle node tpl.js public/template.html public/index.bundle.html

# gzip production bundle for size comparison (entirely optional)
gzip -kf $DIST/bundle.min.js
