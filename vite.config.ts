import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// 与 Nginx `location /hc-translate/` 一致；开发时请访问 http://localhost:3000/hc-translate/
const BASE = '/hc-translate/'

// https://vitejs.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [
    devtools(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    proxy: {
      '/dwt-tl': {
        target: 'https://dwt.csg.cn:8443', //https://dwt.hq.iv.csg
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
