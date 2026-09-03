import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { reactClickToComponent } from "vite-plugin-react-click-to-component";
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), reactClickToComponent()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
      },
    },
  },
})
