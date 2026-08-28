import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages는 https://<user>.github.io/<repo>/ 하위 경로로 서비스되므로
// 배포 시 워크플로가 VITE_BASE=/<repo>/ 를 넘겨준다. 로컬에서는 '/'.
// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
})
