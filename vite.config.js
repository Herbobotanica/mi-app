import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/proxy': {
        target: 'https://script.google.com/macros/s/AKfycbydPvxfDbCiFv4cv3xHTtfU9DliO8PFzJ3ePnCcAfooZ-kemNTm2oQDv_mtPHhtGvDq',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/proxy', '/exec'),
        followRedirects: true,
      }
    }
  }
})