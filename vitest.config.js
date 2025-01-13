import { defineConfig } from 'vitest/config'
import path from 'node:path'
import dotenv from 'dotenv'

dotenv.config({ path: './.env' })
export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Asegúrate de usar el entorno de Node
    coverage: {
      provider: 'v8', // También puedes usar 'c8'
      reporter: ['text', 'html'] // Configura los reportes de cobertura
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
