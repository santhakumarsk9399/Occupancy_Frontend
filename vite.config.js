import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
	base: '/',   // ⭐ THIS IS THE FIX
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3001,
    allowedHosts: ["10.10.40.79"],
    hmr: {
      host: "10.10.40.79",
      protocol: "ws",   // use ws if not using HTTPS
      port: 3001
    }
  }
})



