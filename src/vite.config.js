import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3001,
    allowedHosts: ["delbi2dev.deloptanalytics.com"],
    hmr: {
      host: "delbi2dev.deloptanalytics.com",
      protocol: "wss",   // use ws if not using HTTPS
      port: 3001
    }
  }
})



