import pkg from './package.json';

const config = [{
  input: './src/apivis.cjs.js',
  output: {
    format: 'cjs',
    file: pkg.main
  }
}, {
  input: './src/apivis.umd.js',
  output: {
    format: 'umd',
    file: pkg.browser,
    name: 'apivis'
  }
}, {
  input: './src/apivis.es.js',
  output: {
    format: 'es',
    file: pkg.module
  }
}];

export default config;
