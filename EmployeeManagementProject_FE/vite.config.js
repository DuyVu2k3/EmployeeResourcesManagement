import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path" // Thêm dòng này

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), 
    },
  },
})