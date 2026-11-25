import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite';
import AutoImport from 'unplugin-auto-import/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    AutoImport({
      imports: [
        {
          '/src/lib/notify': ['notify'],
        },
      ],

      dts: 'src/types/auto-imports.d.ts',
      include: [
        /\.[tj]sx?$/,
      ],

      viteOptimizeDeps: true,
    }),
  ],
});
