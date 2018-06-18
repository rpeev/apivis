import pkg from './package.json';

const config = [{
  input: './src/apivis.js',
  output: {
    format: 'es',
    file: pkg.module
  }
}, {
  input: './src/apivis.js',
  output: {
    format: 'cjs',
    file: pkg.main,
    exports: 'named'
  }
}, {
  input: './src/apivis.js',
  output: {
    format: 'umd',
    file: pkg.browser,
    exports: 'named',
    name: 'apivis'
  }
}];

export default config;
