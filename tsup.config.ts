import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external: ['vue', '@user-xxy/utils'],
  treeshake: true,
  splitting: false,
  target: 'es2020',
})
