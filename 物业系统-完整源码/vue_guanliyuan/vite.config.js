import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite' // 自动导入vue中的API
import Components from 'unplugin-vue-components/vite' // 自动导入UI组件，比如 element-plus
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers' // 组件库解析器

// https://vite.dev/config/
export default defineConfig({
  // 本地 npm run dev 时，将前端的 /api 请求转发到 Spring Boot。
  // 生产环境由 nginx.conf 提供同样的 /api 反向代理。
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [
        ElementPlusResolver({ importStyle: 'sass' }),
      ],
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/css/index.scss" as *;`,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vue': 'vue/dist/vue.esm-bundler.js',  // 关键：指定带模板编译器的vue版本
    },
  },
})
