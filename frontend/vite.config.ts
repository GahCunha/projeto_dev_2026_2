import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { reactClickToComponent } from "vite-plugin-react-click-to-component";
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), reactClickToComponent()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
      },
    },
  },
})
