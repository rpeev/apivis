import json from 'rollup-plugin-json';

import pkg from './package.json';

const pluginJson = json({
  preferConst: true
});

const config = [{
  input: './src/apivis.js',
  output: {
    format: 'cjs',
    file: pkg.main
  },
  plugins: [
    pluginJson
  ]
}, {
  input: './src/apivis.js',
  output: {
    format: 'umd',
    file: pkg.browser,
    name: pkg.name
  },
  plugins: [
    pluginJson
  ]
}, {
  input: './src/apivis.es.js',
  output: {
    format: 'es',
    file: pkg.module
  },
  plugins: [
    pluginJson
  ]
}];

export default config;