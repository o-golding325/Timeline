import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import events from '../data/events.json'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
})
