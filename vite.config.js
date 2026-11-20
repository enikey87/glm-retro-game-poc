import { defineConfig } from 'vite'

// base './' so the bundle works from the GitHub Pages subpath /glm-retro-game-poc/
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 2000,
  },
})
