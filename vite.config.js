import { defineConfig } from 'vite'
import fs from 'fs-extra'

export default defineConfig({
  build: {
    lib: {
      entry: 'main.js',
      formats: ['cjs'],
      fileName: () => 'index.js',
    },
    minify: false,
    outDir: 'cloud',
    sourcemap: true,
    emptyOutDir: false,
    rollupOptions: {
      external: [
        'node-schedule',
        'axios',
        'jsdom',
        'lodash/cloneDeep.js',
        'lunar-javascript',
        'dayjs',
        'dayjs/plugin/timezone.js',
        'dayjs/plugin/utc.js',
        'puppeteer',
        'path',
        'fs',
        'http',
        'sirv',
        'base64-img',
        'form-data',
        'url',
      ],
      plugins: [{
        async load(id) {
          if (/\/config\/exp-config\.js$/.test(id)) {
            return (await fs.readFile(id)).toString()
              .replace('import USER_CONFIG from \'./index.cjs\'', 'var USER_CONFIG = require(\'../config/index.cjs\')').replace(/fileURLToPath\(import\.meta\.url\), '\.\.\/\.\.\//g, '__dirname, \'')
          }
          return (await fs.readFile(id)).toString().replace(/fileURLToPath\(import\.meta\.url\), '\.\.\/\.\.\//g, '__dirname, \'')
        },
      }],
    },
  },
})
