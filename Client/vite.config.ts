import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
     watch: {
      usePolling: true, // Forces Vite to check files manually
    },
    host: true, // Needed so you can access it via localhost:5173
  }
})
