module.exports = [
  {
    id: 'axios',
    src: 'https://unpkg.com/axios@0/dist/axios.min.js'
  },
  {
    id: 'dragula',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/dragula/3.7.2/dragula.min.js'
  },
  {
    id: 'highlight.js',
    src:
      'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/highlight.min.js'
  },
  {
    id: 'jquery',
    src: 'https://code.jquery.com/jquery-3.5.0.js',
    srcProduction: 'https://code.jquery.com/jquery-3.5.0.min.js',
    named: true,
    inferredId: 'jquery-3'
  },
  {
    id: 'moment',
    src: 'https://unpkg.com/moment@2/moment.js'
  },
  {
    id: 'leaflet',
    src: 'https://unpkg.com/leaflet@1/dist/leaflet-src.js'
  },
  {
    id: 'lodash',
    src: 'https://unpkg.com/lodash@4/lodash.js'
  },
  {
    id: 'react',
    src: 'https://unpkg.com/react@16/umd/react.development.js',
    srcProduction: 'https://unpkg.com/react@16/umd/react.production.min.js'
  },
  {
    id: 'react-dom',
    src: 'https://unpkg.com/react-dom@16/umd/react-dom.development.js',
    srcProduction:
      'https://unpkg.com/react-dom@16/umd/react-dom.production.min.js'
  },
  {
    id: 'foo',
    src: 'scripts/vendor/foo.js'
  },
  {
    id: 'bar',
    src: 'scripts/vendor/bar.min.js'
  },
  {
    id: '@test/baz',
    src: 'scripts/vendor/@test/baz.min.js'
  }
];
