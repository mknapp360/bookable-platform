import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

const crmCoreSrc = path.resolve(__dirname, '../../bookable-crm/src')

export default defineConfig({
  plugins: [
    // Resolves @/ aliases per-package using each file's nearest tsconfig.json.
    // This means @/ in crm-core files → bookable-crm/src, and
    //             @/ in wilkinson-admin files → apps/wilkinson-admin/src
    tsconfigPaths(),
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      // @bookable/crm-core → bookable-crm/src (processed as raw TS source by Vite)
      '@bookable/crm-core': crmCoreSrc,
    },
  },
})
