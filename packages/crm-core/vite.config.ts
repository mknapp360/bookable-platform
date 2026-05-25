import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    // Don't inline env vars at library build time — let the consuming app resolve them
    'import.meta.env.VITE_SUPABASE_URL': 'import.meta.env.VITE_SUPABASE_URL',
    'import.meta.env.VITE_SUPABASE_ANON_KEY': 'import.meta.env.VITE_SUPABASE_ANON_KEY',
    'import.meta.env.VITE_TURNSTILE_SITE_KEY': 'import.meta.env.VITE_TURNSTILE_SITE_KEY',
    'import.meta.env.VITE_SITE_URL': 'import.meta.env.VITE_SITE_URL',
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react-router-dom',
        '@supabase/supabase-js',
        '@marsidev/react-turnstile',
        'lucide-react',
        /^@radix-ui\//,
        'class-variance-authority',
        'clsx',
        'tailwind-merge',
      ],
    },
    cssCodeSplit: false,
  },
})
