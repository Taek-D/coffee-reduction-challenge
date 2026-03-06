import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    }),
  ],
  build: {
    // TDS Mobile이 단일 ESM 엔트리로 배포돼서 기본 500kB 경고는 과도하게 발생한다.
    chunkSizeWarningLimit: 950,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (id.includes('@apps-in-toss') || id.includes('@granite-js')) {
            return 'apps-in-toss';
          }

          if (id.includes('@toss/tds-mobile') || id.includes('@emotion')) {
            return 'tds';
          }

          if (id.includes('react-router')) {
            return 'router';
          }

          if (
            id.includes('react-dom') ||
            id.includes('react/jsx-runtime') ||
            /node_modules[\\/](react|scheduler)[\\/]/.test(id)
          ) {
            return 'react-vendor';
          }
        },
      },
    },
  },
})
