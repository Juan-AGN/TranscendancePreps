import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Babylon uses many runtime shader modules that can break pre-bundling.
    exclude: ['@babylonjs/core', '@babylonjs/loaders'],
  },
})
