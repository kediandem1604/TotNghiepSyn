import { defineConfig, loadEnv } from 'vite'
import { apiPlugin } from './vite-plugin-api.js'

/** Chèn địa chỉ trang (vd. https://ten-trang.netlify.app) vào ảnh xem trước khi gửi link. */
function siteUrl(url) {
  return {
    name: 'thiep-site-url',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', url),
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Netlify tự đặt URL khi build bằng `netlify deploy --build`; SITE_URL trong .env để ghi đè.
  const url = (env.SITE_URL || process.env.URL || '').replace(/\/+$/, '')
  return {
    plugins: [apiPlugin(), siteUrl(url)],
    build: {
      rollupOptions: {
        input: {
          main: 'index.html',
          admin: 'quan-li/index.html',
        },
      },
    },
  }
})
