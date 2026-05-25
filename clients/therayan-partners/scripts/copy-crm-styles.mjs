import { copyFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = resolve(__dirname, '../../../packages/crm-core/dist/index.css')
mkdirSync(resolve(__dirname, '../public'), { recursive: true })
copyFileSync(src, resolve(__dirname, '../public/crm-core.css'))
console.log('Copied crm-core styles to public/crm-core.css')
