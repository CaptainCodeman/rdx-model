'use strict';

import pkg from './package.json';
import typescript from 'rollup-plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import size from 'rollup-plugin-size';

const plugins = [
  typescript({ typescript: require('typescript') }),
  terser(),
  size(),
]

export default [{
  input: {
    index: 'src/index.ts',
    createModel: 'src/createModel.ts',
    routing: 'src/routingPlugin.ts',
  },
  output: {
    dir: 'lib',
    format: 'esm',
    sourcemap: true,
  },
  plugins,
}, {
  input: 'src/index.ts',
  output: [{
    file: pkg.main,
    format: 'cjs',
  }, {
    file: 'lib/index.min.js',
    format: 'esm',
    sourcemap: true,
  }],
  plugins,
}, {
  input: 'src/index.ts',
  output: {
    file: pkg.browser,
    format: 'umd',
    name: 'store',
    esModule: false
  },
  plugins,
}]
