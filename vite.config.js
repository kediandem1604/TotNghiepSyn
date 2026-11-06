import { defineConfig } from 'vite'
import { apiPlugin } from './vite-plugin-api.js'

export default defineConfig({
  plugins: [apiPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'quan-li/index.html',
      },
    },
  },
})
