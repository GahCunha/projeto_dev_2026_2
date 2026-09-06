import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { reactClickToComponent } from 'vite-plugin-react-click-to-component'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const enableComponentInspector = env.VITE_COMPONENT_INSPECTOR === 'true'

  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(enableComponentInspector ? [reactClickToComponent()] : []),
    ],
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
  }
})
