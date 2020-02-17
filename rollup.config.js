'use strict';

import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import size from 'rollup-plugin-size';

export default {
  input: {
    index: 'src/index.ts',
    createStore: 'src/createStore.ts',
    createModel: 'src/createModel.ts',
    routing: 'src/routingPlugin.ts',
  },
  output: {
    dir: 'lib',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    typescript({ typescript: require('typescript') }),
    terser(),
    size(),
  ]
}
