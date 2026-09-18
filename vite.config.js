import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Served from https://hicham-om.github.io/weather-dashboard/ on GitHub Pages.
  base: process.env.GITHUB_PAGES ? '/weather-dashboard/' : '/',
  plugins: [react()],
})
